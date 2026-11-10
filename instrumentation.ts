export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { registerInsightFixes } = await import('./lib/insight-fix-register');
    await registerInsightFixes();
  }
}
