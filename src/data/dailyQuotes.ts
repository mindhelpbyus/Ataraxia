export const dailyQuotes = [
  "Peace comes from within. Do not seek it without.",
  "The greatest wealth is to live content with little.",
  "Happiness is not something ready made. It comes from your own actions.",
  "In the midst of movement and chaos, keep stillness inside of you.",
  "The mind is everything. What you think you become.",
  "Be kind whenever possible. It is always possible.",
  "Your calm mind is the ultimate weapon against your challenges.",
  "Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.",
  "The only way out is through.",
  "You are the sky. Everything else is just the weather.",
  "Slow breathing is like an anchor in the midst of an emotional storm.",
  "Between stimulus and response there is a space. In that space is our power to choose.",
  "The curious paradox is that when I accept myself just as I am, then I can change.",
  "Almost everything will work again if you unplug it for a few minutes, including you.",
  "Self-care is giving the world the best of you, instead of what's left of you.",
  "You don't have to control your thoughts. You just have to stop letting them control you.",
  "Healing takes time, and asking for help is a courageous step.",
  "Your mental health is a priority. Your happiness is essential. Your self-care is a necessity.",
  "It's okay to not be okay. It's not okay to stay that way.",
  "Growth is painful. Change is painful. But nothing is as painful as staying stuck somewhere you don't belong.",
  "You are not your illness. You have an individual story to tell.",
  "Mental health is not a destination, but a process. It's about how you drive, not where you're going.",
  "Recovery is not one and done. It is a lifelong journey that takes place one day, one step at a time.",
  "Courage doesn't always roar. Sometimes courage is the quiet voice at the end of the day saying, 'I will try again tomorrow.'",
  "The strongest people are not those who show strength in front of us but those who win battles we know nothing about.",
  "You are allowed to be both a masterpiece and a work in progress simultaneously.",
  "Talk to yourself like you would to someone you love.",
  "Your present circumstances don't determine where you can go; they merely determine where you start.",
  "Breathe. It's just a bad day, not a bad life.",
  "Sometimes the bravest thing you can do is ask for help.",
  "You are worthy of the quiet you seek, the peace you need, and the love you deserve."
];

/**
 * Gets the daily quote based on the current date
 * The same quote will be shown for the entire day (across all users)
 */
export function getDailyQuote(): string {
  const today = new Date();
  // Create a consistent index based on day of year
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const diff = today.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  // Use modulo to cycle through quotes
  const quoteIndex = dayOfYear % dailyQuotes.length;
  
  return dailyQuotes[quoteIndex];
}
