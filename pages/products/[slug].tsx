import { DataProvider } from "@plasmicapp/host";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { NextParsedUrlQuery } from "next/dist/server/request-meta";
import { ParsedUrlQuery } from "querystring";
import * as React from "react";
import GlobalContextsProvider from "../../components/plasmic/cms_example/PlasmicGlobalContextsProvider";
import { PlasmicProduct } from "../../components/plasmic/cms_example/PlasmicProduct";

const cmsConfig = {
  host: `https://studio.plasmic.app`,
  databaseId: `gCKFKDQ581NNXUi9iwbMyZ`,
  databaseToken: `69xOVFM7WmWwaLLG1jJhmv9TMvHMH4MXfAkJiuz5dk5Y1IyTW1Z1GzYJVtWfDFZ7nY8ql7FnFaf7T8wNv42WQ`,
};

// TODO: We could export API from @plasmicpkgs/plasmic-cms to avoid needing
// to re-implement this.
async function apiGet(endpoint: string, params: {} = {}) {
  const url = new URL(
    `${cmsConfig.host}/api/v1/cms/databases/${cmsConfig.databaseId}${endpoint}`
  );
  url.search = new URLSearchParams(params).toString();
  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      accept: "*/*",
      "x-plasmic-api-cms-tokens": `${cmsConfig.databaseId}:${cmsConfig.databaseToken}`,
    },
    mode: "cors",
  });

  if (response.status !== 200) {
    const message = await response.text();
    throw new Error(`${response.status}: ${message}`);
  }

  return await response.json();
}

interface ProductParams extends ParsedUrlQuery {
  slug: string;
}

interface Product {
  data: {
    slug: string;
    title: string;
    price: string;
  };
}

interface ProductProps {
  product: Product;
}

export const getStaticPaths: GetStaticPaths<ProductParams> = async () => {
  const products: Product[] = (
    await apiGet(`/tables/products/query`, {
      q: "{}",
    })
  ).rows;

  return {
    paths: products.map((p) => ({
      params: { slug: p.data.slug },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<
  ProductProps,
  ProductParams
> = async (context) => {
  const slug = context.params?.slug;
  if (!slug) {
    throw new Error("Missing slug");
  }
  const products: Product[] = (
    await apiGet(`/tables/products/query`, {
      q: JSON.stringify({ where: { slug } }),
    })
  ).rows;
  return { props: { product: products[0] } };
};

const Product: NextPage<ProductProps> = ({ product }) => {
  return (
    <GlobalContextsProvider>
      <DataProvider name={`__plasmic_cms_query_products`} data={[product]}>
        <PlasmicProduct />
      </DataProvider>
    </GlobalContextsProvider>
  );
};

export default Product;
