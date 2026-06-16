export function publicUser(user) {
  if (!user) return null;
  const { pinHash: _pinHash, ...safeUser } = user;
  return safeUser;
}

export function optionSafeQuestion(question) {
  if (!question) return null;
  const { correctOptionId: _correctOptionId, ...safeQuestion } = question;
  return safeQuestion;
}
