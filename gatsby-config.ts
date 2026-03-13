import type { GatsbyConfig } from "gatsby";
import * as dotenv from "dotenv";

dotenv.config({
  path: `.env.${process.env.NODE_ENV}`,
});

const config: GatsbyConfig = {
  siteMetadata: {
    title: `administration`,
    siteUrl: `https://thepmsquare.github.io/administration`,
  },
  pathPrefix: "/administration",
  // More easily incorporate content into your pages through automatic TypeScript type generation and better GraphQL IntelliSense.
  // If you use VSCode you can also use the GraphQL plugin
  // Learn more at: https://gatsby.dev/graphql-typegen
  graphqlTypegen: false,
  plugins: [
    "gatsby-plugin-sitemap",
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        icon: "src/images/square.svg",
        name: "administration",
        short_name: "admin",
        lang: "en",
        background_color: "#000000",
        theme_color: "#00ffff",
        display: "standalone",
        icon_options: {
          purpose: `any maskable`,
        },
        description: "administration portal for square services.",
      },
    },
    "gatsby-plugin-offline",
  ],
};

export default config;
