// src/services/contentSync.ts
// Content Synchronization Service (Fixed - No Expo Crypto)

import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
import { getModules, getLessonsByModule, getModuleProgress } from './db';

// Types
export interface ContentVersion {
  version: string;
  timestamp: number;
  checksum: string;
  author: string;
  changes: ContentChange[];
}

export interface ContentChange {
  type: 'module_added' | 'module_updated' | 'module_deleted' | 'progress_updated';
  moduleId: number;
  data: any;
  timestamp: number;
}

export interface MergeResult {
  success: boolean;
  conflicts: MergeConflict[];
  mergedContent: any;
  strategy: 'auto' | 'local_wins' | 'remote_wins' | 'manual';
}

export interface MergeConflict {
  moduleId: number;
  conflictType: 'progress' | 'content' | 'both';
  localVersion: ContentVersion;
  remoteVersion: ContentVersion;
  commonAncestor: ContentVersion | null;
  resolution: 'pending' | 'resolved';
  resolvedData?: any;
}

export interface SyncStatus {
  lastSyncTime: number;
  localVersion: string;
  remoteVersion: string;
  pendingChanges: number;
  conflictCount: number;
  syncState: 'idle' | 'syncing' | 'conflict' | 'error';
}

// Content Sync Service
class ContentSyncService {
  private readonly VERSION_HISTORY_KEY = '@content_version_history';
  private readonly CURRENT_VERSION_KEY = '@current_content_version';
  private readonly CONFLICTS_KEY = '@merge_conflicts';
  
  // Get current content version
  public async getCurrentVersion(): Promise<ContentVersion> {
    try {
      const versionJson = await AsyncStorage.getItem(this.CURRENT_VERSION_KEY);
      
      if (versionJson) {
        return JSON.parse(versionJson);
      }
      
      // Create initial version
      const initialVersion: ContentVersion = {
        version: '1.0.0',
        timestamp: Date.now(),
        checksum: await this.calculateContentChecksum(),
        author: 'local',
        changes: [],
      };
      
      await this.saveVersion(initialVersion);
      return initialVersion;
    } catch (error) {
      console.error('Failed to get current version:', error);
      throw error;
    }
  }

  // Calculate checksum for all content (using CryptoJS)
  private async calculateContentChecksum(): Promise<string> {
    try {
      const modules = getModules();
      const contentString = JSON.stringify(modules);
      return CryptoJS.SHA256(contentString).toString();
    } catch (error) {
      console.error('Failed to calculate checksum:', error);
      return '';
    }
  }

  // Save version to history
  private async saveVersion(version: ContentVersion): Promise<void> {
    try {
      // Save as current version
      await AsyncStorage.setItem(
        this.CURRENT_VERSION_KEY,
        JSON.stringify(version)
      );
      
      // Add to version history
      const history = await this.getVersionHistory();
      history.push(version);
      
      // Keep only last 50 versions
      const trimmedHistory = history.slice(-50);
      
      await AsyncStorage.setItem(
        this.VERSION_HISTORY_KEY,
        JSON.stringify(trimmedHistory)
      );
    } catch (error) {
      console.error('Failed to save version:', error);
    }
  }

  // Get version history
  public async getVersionHistory(): Promise<ContentVersion[]> {
    try {
      const historyJson = await AsyncStorage.getItem(this.VERSION_HISTORY_KEY);
      return historyJson ? JSON.parse(historyJson) : [];
    } catch (error) {
      console.error('Failed to get version history:', error);
      return [];
    }
  }

  // Find common ancestor version
  public async findCommonAncestor(
    localVersion: ContentVersion,
    remoteVersion: ContentVersion
  ): Promise<ContentVersion | null> {
    try {
      const history = await this.getVersionHistory();
      
      // Build version graph
      const localVersions = new Set<string>();
      
      // Find all ancestors of local version
      let current: ContentVersion | undefined = localVersion;
      while (current) {
        localVersions.add(current.version);
        current = history.find(v => 
          v.timestamp < current!.timestamp && 
          v.checksum !== current!.checksum
        );
      }
      
      // Find first common ancestor in remote version's history
      current = remoteVersion;
      while (current) {
        if (localVersions.has(current.version)) {
          return current; // Found common ancestor
        }
        current = history.find(v => 
          v.timestamp < current!.timestamp && 
          v.checksum !== current!.checksum
        );
      }
      
      return null; // No common ancestor found
    } catch (error) {
      console.error('Failed to find common ancestor:', error);
      return null;
    }
  }

  // Merge remote content with local content
  public async mergeContent(
    remoteVersion: ContentVersion,
    remoteContent: any
  ): Promise<MergeResult> {
    try {
      const localVersion = await this.getCurrentVersion();
      const commonAncestor = await this.findCommonAncestor(localVersion, remoteVersion);
      
      console.log('🔀 Merging content...');
      console.log('📍 Local version:', localVersion.version);
      console.log('📍 Remote version:', remoteVersion.version);
      console.log('📍 Common ancestor:', commonAncestor?.version || 'none');
      
      // If versions are the same, no merge needed
      if (localVersion.checksum === remoteVersion.checksum) {
        return {
          success: true,
          conflicts: [],
          mergedContent: null,
          strategy: 'auto',
        };
      }
      
      // If no common ancestor, use remote content (first sync)
      if (!commonAncestor) {
        console.log('📥 No common ancestor - using remote content');
        return {
          success: true,
          conflicts: [],
          mergedContent: remoteContent,
          strategy: 'remote_wins',
        };
      }
      
      // Attempt automatic merge
      const conflicts: MergeConflict[] = [];
      const mergedContent = await this.performThreeWayMerge(
        commonAncestor,
        localVersion,
        remoteVersion,
        remoteContent,
        conflicts
      );
      
      // If conflicts detected, save them for manual resolution
      if (conflicts.length > 0) {
        await this.saveConflicts(conflicts);
        
        return {
          success: false,
          conflicts,
          mergedContent: null,
          strategy: 'manual',
        };
      }
      
      // No conflicts - merge successful
      return {
        success: true,
        conflicts: [],
        mergedContent,
        strategy: 'auto',
      };
    } catch (error) {
      console.error('Failed to merge content:', error);
      throw error;
    }
  }

  // Perform three-way merge (Git-like)
  private async performThreeWayMerge(
    ancestor: ContentVersion,
    local: ContentVersion,
    remote: ContentVersion,
    remoteContent: any,
    conflicts: MergeConflict[]
  ): Promise<any> {
    const localContent = getModules();
    const mergedModules: any[] = [];
    
    // Create maps for quick lookup
    const ancestorMap = new Map(
      ancestor.changes.map(c => [c.moduleId, c])
    );
    const localMap = new Map(
      local.changes.map(c => [c.moduleId, c])
    );
    const remoteMap = new Map(
      remote.changes.map(c => [c.moduleId, c])
    );
    
    // Get all unique module IDs
    const allModuleIds = new Set([
      ...ancestorMap.keys(),
      ...localMap.keys(),
      ...remoteMap.keys(),
    ]);
    
    // Merge each module
    for (const moduleId of allModuleIds) {
      const ancestorChange = ancestorMap.get(moduleId);
      const localChange = localMap.get(moduleId);
      const remoteChange = remoteMap.get(moduleId);
      
      // Case 1: Module exists in all three versions
      if (ancestorChange && localChange && remoteChange) {
        // Check if both local and remote modified the module
        if (
          localChange.timestamp > ancestorChange.timestamp &&
          remoteChange.timestamp > ancestorChange.timestamp
        ) {
          // Both modified - potential conflict
          const hasProgressConflict = this.hasProgressConflict(
            localChange.data,
            remoteChange.data
          );
          
          if (hasProgressConflict) {
            // Conflict detected - preserve local progress
            conflicts.push({
              moduleId,
              conflictType: 'progress',
              localVersion: local,
              remoteVersion: remote,
              commonAncestor: ancestor,
              resolution: 'pending',
            });
            
            // Use local version (preserve user progress)
            mergedModules.push(localChange.data);
          } else {
            // No real conflict - merge changes
            const merged = this.mergeModuleData(
              localChange.data,
              remoteChange.data
            );
            mergedModules.push(merged);
          }
        } else if (localChange.timestamp > ancestorChange.timestamp) {
          // Only local modified
          mergedModules.push(localChange.data);
        } else {
          // Only remote modified or no changes
          mergedModules.push(remoteChange.data);
        }
      }
      // Case 2: Module only in remote (new module)
      else if (!localChange && remoteChange) {
        mergedModules.push(remoteChange.data);
      }
      // Case 3: Module only in local (keep it)
      else if (localChange && !remoteChange) {
        mergedModules.push(localChange.data);
      }
    }
    
    return mergedModules;
  }

  // Check if there's a progress conflict
  private hasProgressConflict(localData: any, remoteData: any): boolean {
    const localProgress = localData.progress || 0;
    const remoteProgress = remoteData.progress || 0;
    
    // Consider it a conflict if progress differs
    return Math.abs(localProgress - remoteProgress) > 0;
  }

  // Merge module data intelligently
  private mergeModuleData(localData: any, remoteData: any): any {
    return {
      ...remoteData,
      // Always preserve local progress
      progress: Math.max(localData.progress || 0, remoteData.progress || 0),
      completedLessons: this.mergeArrays(
        localData.completedLessons || [],
        remoteData.completedLessons || []
      ),
      // Use most recent timestamp
      lastAccessed: Math.max(
        localData.lastAccessed || 0,
        remoteData.lastAccessed || 0
      ),
    };
  }

  // Merge two arrays, keeping unique items
  private mergeArrays(arr1: any[], arr2: any[]): any[] {
    return [...new Set([...arr1, ...arr2])];
  }

  // Save conflicts for manual resolution
  private async saveConflicts(conflicts: MergeConflict[]): Promise<void> {
    try {
      const existingConflicts = await this.getConflicts();
      const allConflicts = [...existingConflicts, ...conflicts];
      
      await AsyncStorage.setItem(
        this.CONFLICTS_KEY,
        JSON.stringify(allConflicts)
      );
      
      console.log(`⚠️ Saved ${conflicts.length} conflicts for manual resolution`);
    } catch (error) {
      console.error('Failed to save conflicts:', error);
    }
  }

  // Get pending conflicts
  public async getConflicts(): Promise<MergeConflict[]> {
    try {
      const conflictsJson = await AsyncStorage.getItem(this.CONFLICTS_KEY);
      const conflicts: MergeConflict[] = conflictsJson ? JSON.parse(conflictsJson) : [];
      
      // Filter only pending conflicts
      return conflicts.filter(c => c.resolution === 'pending');
    } catch (error) {
      console.error('Failed to get conflicts:', error);
      return [];
    }
  }

  // Resolve conflict manually
  public async resolveConflict(
    conflict: MergeConflict,
    resolution: 'use_local' | 'use_remote' | 'merge',
    customData?: any
  ): Promise<void> {
    try {
      const conflicts = await AsyncStorage.getItem(this.CONFLICTS_KEY);
      const allConflicts: MergeConflict[] = conflicts ? JSON.parse(conflicts) : [];
      
      // Find and update the conflict
      const index = allConflicts.findIndex(
        c => c.moduleId === conflict.moduleId &&
             c.localVersion.version === conflict.localVersion.version
      );
      
      if (index !== -1) {
        allConflicts[index].resolution = 'resolved';
        
        if (resolution === 'use_local') {
          allConflicts[index].resolvedData = conflict.localVersion.changes.find(
            c => c.moduleId === conflict.moduleId
          )?.data;
        } else if (resolution === 'use_remote') {
          allConflicts[index].resolvedData = conflict.remoteVersion.changes.find(
            c => c.moduleId === conflict.moduleId
          )?.data;
        } else {
          allConflicts[index].resolvedData = customData;
        }
        
        await AsyncStorage.setItem(
          this.CONFLICTS_KEY,
          JSON.stringify(allConflicts)
        );
        
        console.log(`✅ Resolved conflict for module ${conflict.moduleId}`);
      }
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
      throw error;
    }
  }

  // Create new version after changes
  public async createNewVersion(changes: ContentChange[]): Promise<ContentVersion> {
    try {
      const currentVersion = await this.getCurrentVersion();
      
      // Increment version number
      const versionParts = currentVersion.version.split('.').map(Number);
      versionParts[2]++; // Increment patch version
      
      const newVersion: ContentVersion = {
        version: versionParts.join('.'),
        timestamp: Date.now(),
        checksum: await this.calculateContentChecksum(),
        author: 'local',
        changes,
      };
      
      await this.saveVersion(newVersion);
      console.log(`📦 Created new version: ${newVersion.version}`);
      
      return newVersion;
    } catch (error) {
      console.error('Failed to create new version:', error);
      throw error;
    }
  }

  // Get sync status
  public async getSyncStatus(): Promise<SyncStatus> {
    try {
      const currentVersion = await this.getCurrentVersion();
      const conflicts = await this.getConflicts();
      
      return {
        lastSyncTime: currentVersion.timestamp,
        localVersion: currentVersion.version,
        remoteVersion: 'unknown',
        pendingChanges: 0,
        conflictCount: conflicts.length,
        syncState: conflicts.length > 0 ? 'conflict' : 'idle',
      };
    } catch (error) {
      console.error('Failed to get sync status:', error);
      return {
        lastSyncTime: 0,
        localVersion: '0.0.0',
        remoteVersion: 'unknown',
        pendingChanges: 0,
        conflictCount: 0,
        syncState: 'error',
      };
    }
  }

  // Export content for sharing
  public async exportContent(moduleIds?: number[]): Promise<any> {
    try {
      const currentVersion = await this.getCurrentVersion();
      const modules = getModules();
      
      let contentToExport = modules;
      if (moduleIds) {
        contentToExport = modules.filter(m => moduleIds.includes(m.id));
      }
      
      // Get lessons for each module
      const contentWithLessons = await Promise.all(
        contentToExport.map(async (module) => {
          const lessons = getLessonsByModule(module.id);
          const progress = getModuleProgress(module.id);
          
          return {
            module,
            lessons,
            progress,
          };
        })
      );
      
      return {
        version: currentVersion,
        content: contentWithLessons,
        exportedAt: Date.now(),
      };
    } catch (error) {
      console.error('Failed to export content:', error);
      throw error;
    }
  }

  // Import content from peer
  public async importContent(importedData: any): Promise<MergeResult> {
    try {
      const remoteVersion: ContentVersion = importedData.version;
      const remoteContent = importedData.content;
      
      // Perform merge
      const result = await this.mergeContent(remoteVersion, remoteContent);
      
      if (result.success && result.mergedContent) {
        // Apply merged content
        console.log('✅ Content imported and merged successfully');
        
        // Create new version
        const changes: ContentChange[] = remoteContent.map((item: any) => ({
          type: 'module_updated' as const,
          moduleId: item.module.id,
          data: item,
          timestamp: Date.now(),
        }));
        
        await this.createNewVersion(changes);
      }
      
      return result;
    } catch (error) {
      console.error('Failed to import content:', error);
      throw error;
    }
  }

  // Clear all conflicts
  public async clearConflicts(): Promise<void> {
    await AsyncStorage.removeItem(this.CONFLICTS_KEY);
    console.log('🧹 All conflicts cleared');
  }

  // Reset version history
  public async resetVersionHistory(): Promise<void> {
    await AsyncStorage.removeItem(this.VERSION_HISTORY_KEY);
    await AsyncStorage.removeItem(this.CURRENT_VERSION_KEY);
    await AsyncStorage.removeItem(this.CONFLICTS_KEY);
    console.log('🔄 Version history reset');
  }
}

// Export singleton instance
export const contentSyncService = new ContentSyncService();
export default contentSyncService;