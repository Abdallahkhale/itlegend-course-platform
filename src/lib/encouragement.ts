export function progressEncouragement(percentage: number): string {
  if (percentage >= 100) return "عاش يا بطل! خلّصت الكورس 🎉 دلوقتي ورّينا شغلك في مشروع من عندك.";
  if (percentage >= 75) return "قربت تخلّص! بلاش تفصل دلوقتي 😅 كمّل الباقي وراجع اللي محتاج تدريب.";
  if (percentage >= 50) return "عدّيت نص الطريق 👏 شد حيلك في اللي باقي، وكل درس وراه تطبيق.";
  if (percentage >= 25) return "المشاهدة لوحدها مش كفاية 😄 افتح التطبيق وجرّب اللي اتعلمته.";
  if (percentage > 0) return "بداية حلوة! كمّل واحدة واحدة، وطبّق بإيدك عشان المعلومة تثبت ✍️";
  return "يلا نبدأ بأول درس، خطوة صغيرة النهارده تفرق معاك بكرة 💪";
}
