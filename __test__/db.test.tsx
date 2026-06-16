// __test__/db.test.tsx
// Fixed Database Service Tests

import {
  initDB,
  getModules,
  setLanguage,
  getLanguage,
  refreshTranslations,
  t,
  markLessonComplete,
  getModuleById,
  getLessonsByModule,
  resetProgress,
} from '../src/services/db';

describe('Database Service', () => {
  beforeEach(() => {
    // IMPORTANT: Set language to English before each test
    setLanguage('en');
    // Reset database before each test
    initDB();
  });

  describe('Language Management', () => {
    test('should initialize with English as default', () => {
      expect(getLanguage()).toBe('en');
    });

    test('should set and get language correctly', () => {
      setLanguage('ms');
      expect(getLanguage()).toBe('ms');

      setLanguage('zh');
      expect(getLanguage()).toBe('zh');

      setLanguage('en');
      expect(getLanguage()).toBe('en');
    });

    test('should translate text based on current language', () => {
      setLanguage('en');
      expect(t('ui.completed')).toBe('Completed');
      expect(t('ui.inProgress')).toBe('In Progress');
      expect(t('ui.notStarted')).toBe('Not Started');

      setLanguage('ms');
      expect(t('ui.completed')).toBe('Selesai');
      expect(t('ui.inProgress')).toBe('Dalam Kemajuan');
      expect(t('ui.notStarted')).toBe('Belum Bermula');
    });

    test('should return key if translation not found', () => {
      setLanguage('en');
      expect(t('nonexistent.key')).toBe('nonexistent.key');
    });

    test('should support placeholders in translations', () => {
      setLanguage('en');
      const result = t('assessment.questionOf', { current: 1, total: 8 });
      expect(result).toBe('Question 1 of 8');

      const modules = t('assessment.modulesSelected', { count: 3 });
      expect(modules).toContain('3 modules');
    });

    test('should refresh translations when language changes', () => {
      setLanguage('en');
      refreshTranslations();
      const modulesEN = getModules();
      expect(modulesEN[0].title).toBe('Gmail Basics');

      setLanguage('ms');
      refreshTranslations();
      initDB(); // Re-initialize after language change
      const modulesMS = getModules();
      expect(modulesMS[0].title).toBe('Asas Gmail');
    });
  });

  describe('Module Management', () => {
    test('should initialize exactly 6 modules', () => {
      const modules = getModules();
      expect(modules).toHaveLength(6);
    });

    test('should have required properties for each module', () => {
      const modules = getModules();
      
      modules.forEach(module => {
        expect(module).toHaveProperty('id');
        expect(module).toHaveProperty('title');
        expect(module).toHaveProperty('desc');
        expect(module).toHaveProperty('status');
        expect(module).toHaveProperty('category');
        expect(module).toHaveProperty('mins');
        expect(module).toHaveProperty('image');
      });
    });

    test('should get module by ID', () => {
      const module = getModuleById(1);
      
      expect(module).not.toBeNull();
      expect(module?.id).toBe(1);
      expect(module?.title).toBeTruthy();
    });

    test('should return null for non-existent module', () => {
      const module = getModuleById(999);
      expect(module).toBeNull();
    });

    test('should have correct initial status', () => {
      // Ensure we're in English
      setLanguage('en');
      initDB();
      
      const modules = getModules();
      
      modules.forEach(module => {
        expect(module.status).toBe('Not Started');
      });
    });

    test('should have correct initial status in Malay', () => {
      setLanguage('ms');
      initDB();
      
      const modules = getModules();
      
      modules.forEach(module => {
        expect(module.status).toBe('Belum Bermula');
      });
    });

    test('should categorize modules correctly', () => {
      const modules = getModules();
      
      const categories = modules.map(m => m.category);
      expect(categories).toContain('communication');
      expect(categories).toContain('navigation');
      expect(categories).toContain('finance');
      expect(categories).toContain('entertainment');
      expect(categories).toContain('shopping');
    });

    test('should have correct module titles in English', () => {
      setLanguage('en');
      initDB();
      
      const modules = getModules();
      
      expect(modules[0].title).toBe('Gmail Basics');
      expect(modules[1].title).toBe('WhatsApp Messenger');
      expect(modules[2].title).toBe('Google Maps Navigation');
      expect(modules[3].title).toBe('Online Banking Safety');
      expect(modules[4].title).toBe('YouTube Basics');
      expect(modules[5].title).toBe('Online Shopping Guide');
    });

    test('should have correct module titles in Malay', () => {
      setLanguage('ms');
      initDB();
      
      const modules = getModules();
      
      expect(modules[0].title).toBe('Asas Gmail');
      expect(modules[1].title).toBe('WhatsApp Messenger');
      expect(modules[2].title).toBe('Navigasi Google Maps');
    });
  });

  describe('Lesson Management', () => {
    test('should get lessons for a module', () => {
      const lessons = getLessonsByModule(1); // Gmail module
      
      expect(lessons.length).toBeGreaterThan(0);
      expect(lessons[0]).toHaveProperty('title');
      expect(lessons[0]).toHaveProperty('module_id', 1);
    });

    test('should order lessons correctly', () => {
      const lessons = getLessonsByModule(1);
      
      for (let i = 1; i < lessons.length; i++) {
        expect(lessons[i].order).toBeGreaterThan(lessons[i - 1].order);
      }
    });

    test('should mark lesson as complete', () => {
      setLanguage('en');
      initDB();
      
      markLessonComplete(1);
      
      const module = getModuleById(1);
      expect(module?.status).toBe('In Progress');
    });

    test('should complete module when all lessons are done', () => {
      setLanguage('en');
      initDB();
      
      // Get all lessons for module 1
      const lessons = getLessonsByModule(1);
      
      // Complete all lessons
      lessons.forEach(lesson => {
        markLessonComplete(lesson.id);
      });
      
      const module = getModuleById(1);
      expect(module?.status).toBe('Completed');
    });

    test('should track completed lessons count', () => {
      setLanguage('en');
      initDB();
      
      const lessons = getLessonsByModule(1);
      
      // Complete first 2 lessons
      markLessonComplete(lessons[0].id);
      markLessonComplete(lessons[1].id);
      
      const module = getModuleById(1);
      expect(module?.status).toBe('In Progress');
    });
  });

  describe('Progress Tracking', () => {
    test('should reset all progress', () => {
      setLanguage('en');
      initDB();
      
      // Complete some lessons
      markLessonComplete(1);
      markLessonComplete(2);
      
      // Reset
      resetProgress();
      
      // Verify everything is reset
      const modules = getModules();
      modules.forEach(module => {
        expect(module.status).toBe('Not Started');
      });
    });

    test('should maintain progress across language changes', () => {
      setLanguage('en');
      initDB();
      
      // Complete a lesson in English
      markLessonComplete(1);
      let module = getModuleById(1);
      expect(module?.status).toBe('In Progress');
      
      // Change to Malay
      setLanguage('ms');
      refreshTranslations();
      
      // Progress should still be there (translated)
      module = getModuleById(1);
      expect(module?.status).toBe('Dalam Kemajuan');
    });
  });

  describe('Translation Placeholders', () => {
    test('should replace single placeholder', () => {
      setLanguage('en');
      
      const result = t('assessment.modulesSelected', { count: 5 });
      expect(result).toContain('5');
    });

    test('should replace multiple placeholders', () => {
      setLanguage('en');
      
      const result = t('assessment.questionOf', { current: 3, total: 8 });
      expect(result).toBe('Question 3 of 8');
    });

    test('should handle missing placeholders gracefully', () => {
      setLanguage('en');
      
      // Call with placeholder but don't provide params
      const result = t('assessment.questionOf');
      // Should still return the string with placeholders
      expect(result).toContain('{current}');
      expect(result).toContain('{total}');
    });
  });

  describe('Assessment Translations', () => {
    test('should have all assessment level translations', () => {
      setLanguage('en');
      
      expect(t('assessment.levels.novice.title')).toBe('New Learner');
      expect(t('assessment.levels.beginner.title')).toBe('Beginner');
      expect(t('assessment.levels.intermediate.title')).toBe('Intermediate');
      expect(t('assessment.levels.advanced.title')).toBe('Advanced');
    });

    test('should have all assessment questions in English', () => {
      setLanguage('en');
      
      for (let i = 1; i <= 8; i++) {
        const question = t(`assessment.questions.q${i}.question`);
        expect(question).toBeTruthy();
        expect(question).not.toContain('assessment.questions');
        
        const options = t(`assessment.questions.q${i}.options`);
        expect(Array.isArray(options)).toBe(true);
        expect(options.length).toBe(4);
      }
    });

    test('should have all assessment questions in Malay', () => {
      setLanguage('ms');
      
      const q1 = t('assessment.questions.q1.question');
      expect(q1).toContain('telefon pintar');
      
      const options = t('assessment.questions.q1.options');
      expect(Array.isArray(options)).toBe(true);
      expect(options[0]).toContain('setiap hari');
    });
  });

  describe('Settings Translations', () => {
    test('should have all settings translations in English', () => {
      setLanguage('en');
      
      expect(t('settings.title')).toBe('Settings');
      expect(t('settings.voice')).toBeTruthy();
      expect(t('settings.notification')).toBeTruthy();
      expect(t('settings.textsize')).toBeTruthy();
      expect(t('settings.account')).toBeTruthy();
      expect(t('settings.logout')).toBeTruthy();
    });

    test('should have all settings translations in Malay', () => {
      setLanguage('ms');
      
      expect(t('settings.title')).toBe('Tetapan');
      expect(t('settings.logout')).toBeTruthy();
    });
  });
});