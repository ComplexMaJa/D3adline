import confetti from "canvas-confetti";

export function triggerCompletionConfetti() {
  try {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#8B5CF6', '#A78BFA', '#22C55E', '#EC4899', '#3B82F6'],
      ticks: 200,
      gravity: 1.2,
      scalar: 0.9,
    });
  } catch (err) {
    // Non-critical animation
    console.error("Confetti trigger error:", err);
  }
}
