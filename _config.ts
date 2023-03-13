import lume from "lume/mod.ts";
import tailwindcss from "lume/plugins/tailwindcss.ts";
import postcss from "lume/plugins/postcss.ts";
import attributes from "lume/plugins/attributes.ts";

const site = lume();

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

site.copy("_assets", ".");

export default site;
