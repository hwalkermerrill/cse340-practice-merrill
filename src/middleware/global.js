// GLOBAL MIDDLEWARE HERE
const addLocalVariables = (req, res, next) => {
  // Set local variables
  const now = new Date();
  const hour = now.getHours();
  const versionIteration = "v1.1.";
  const themes = ["blue-theme", "green-theme", "red-theme"];
  const randomTheme = themes[Math.floor(Math.random() * themes.length)];
  const activePage = req.path.split("/")[1] || "home";

  // Set greetings in Japanese and English based on Time
  const greeting =
    hour < 5 ? { jp: "Nande Okiteru No!?", en: "Why Are You Awake!?" } :
      hour < 12 ? { jp: "Ohayo Gozaimasu!", en: "Good Morning" } :
        hour < 18 ? { jp: "Konnichiwa!", en: "Good Day" } :
          { jp: "Konbanwa!", en: "Good Evening" };

  // Make following variables available to all templates
  res.locals.NODE_ENV = process.env.NODE_ENV?.toLowerCase() || "production";
  res.locals.currentDate = now;
  res.locals.currentYear = now.getFullYear();
  res.locals.queryParams = { ...req.query };
  res.locals.greetingJP = greeting.jp;
  res.locals.greetingEN = greeting.en;
  res.locals.bodyClass = randomTheme;
  res.locals.versionNumber = `${versionIteration}${now.getFullYear().toString().slice(2)}${(now.getMonth() + 1).toString().padStart(2, "0")}`;
  res.locals.activePage = activePage;

  next();
};
const devLogs = (req, res, next) => {
  // Logs to terminal while in development mode
  const isDev = res.locals.NODE_ENV === "development";

  if (isDev && !req.path.startsWith("/.")) {
    console.log(`${req.method} ${req.url}`);
  }
  res.on("finish", () => {
    if (!isDev) return;

    if (Object.keys(req.query).length > 0) {
      console.log("Query:", req.query);
    }
    if (Object.keys(req.params).length > 0) {
      console.log("Params:", req.params);
    }
    console.log(`Response Status: ${res.statusCode}`);
  });

  next();
};

export { addLocalVariables, devLogs };