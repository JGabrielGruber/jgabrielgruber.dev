import lume from "lume/mod.ts";
import tailwindcss from "lume/plugins/tailwindcss.ts";
import postcss from "lume/plugins/postcss.ts";
import attributes from "lume/plugins/attributes.ts";
import basePath from "lume/plugins/base_path.ts";
import multilanguage from "lume/plugins/multilanguage.ts";
import { CookieJar } from "https://deno.land/x/cookies/mod.ts";
import { Accepts } from "https://deno.land/x/accepts/mod.ts";

// Define a middleware function that redirects the user to the appropriate language page
const redirectBasedOnLanguage = async (request: any, next: any) => {
  try {
    const requestedUrl = new URL(request.url);
    const response = await next(request);
    
    // only proceeds if the request is for a page
    if (!requestedUrl.pathname.endsWith("/")) {
      return response;
    }

    const accept = new Accepts(request.headers);
    const cookies = new CookieJar(request, response);
  
    // Get the user's preferred language from the cookie, or from the browser if not set
    const preferredLanguage = cookies.get("language") || accept.languages(languages) || defaultLanguage;
  
    // If the user's preferred language is not available, use the default language
    const language = languages.includes(preferredLanguage) ? preferredLanguage : defaultLanguage;

    // Set the language cookie for future requests
    cookies.set("language", language, { maxAge: 365 * 24 * 60 * 60, path: "/" });

    // Get the base URL of the request
    const baseUrl = new URL(request.url).origin;

    // Get the requested URL and language
    const requestedLanguage = requestedUrl.pathname.split("/")[1] || defaultLanguage;
    
    // Redirect the user to the appropriate language page if the requested language is different from the preferred language
    if (language !== requestedLanguage) {
      const redirectUrl = `${baseUrl}/${language}${requestedUrl.pathname.substr(requestedLanguage.length + 1)}`;
      const headers = new Headers();
      headers.set("Location", redirectUrl);
      return new Response(null, { status: 302, headers });
    } else {
      return response;
    }
  } catch (error) {
    console.error(error);
    return await next(request);
  }
};

var languages = ["en", "pt"];
var defaultLanguage = "en";

const site = lume({
  server: {
    middlewares: [
      redirectBasedOnLanguage,
    ]
  }
});

site.use(
  tailwindcss({
    options: {
      theme: {
        extend: {
          colors: {
            primary: {
              DEFAULT: "#2ad4ff",
              darker: "#21a9cc",
            },
            secondary: "#cccccc",
          },
        },
      },
    },
  })
);
site.use(postcss());
site.use(attributes());
site.use(basePath()); // modify url
site.use(multilanguage({
  extensions: [".njk", ".md"],
  languages: languages, // Available languages
  defaultLanguage: defaultLanguage, // The default language
}));

site.copy("_assets", ".");

export default site;
