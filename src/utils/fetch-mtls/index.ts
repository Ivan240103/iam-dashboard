// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import fetch, { RequestInit } from "node-fetch";
import { readFileSync } from "fs";
import https from "https";
import { auth } from "@/services/oauth-mtls";
import { notFound } from "next/navigation";

let agent: https.Agent | undefined;

try {
  const clientCert = readFileSync(`${process.env.CLIENT_CERT_PATH}`);
  const clientKey = readFileSync(`${process.env.CLIENT_KEY_PATH}`);
  const rootCA = readFileSync(`${process.env.CA_PATH}`);

  agent = new https.Agent({
    cert: clientCert,
    key: clientKey,
    ca: rootCA
  });
} catch (error) {
  console.error("Failed to create mTLS agent:", error);
}

export async function mtlsFetch(endpoint: string | URL, init?: RequestInit) {
  const options: RequestInit = init ?? {};
  let { headers } = options;
  options.headers = {
    ...headers,
    "X-Client": "dashboard-mtls"
  };
  options.agent = agent;
  return fetch(endpoint, options);
}

async function mtlsAuthFetch(endpoint: string | URL, init?: RequestInit) {
  const accessToken = await auth();
  if (!accessToken) {
    throw Error("Session not ready");
  }

  const options: RequestInit = init ?? {};
  let { headers } = options;
  options.headers = {
    ...headers,
    authorization: `Bearer ${accessToken}`
  };
  return mtlsFetch(endpoint, options);
}

export async function mtlsGetItem<T>(endpoint: string | URL): Promise<T> {
  const response = await mtlsAuthFetch(endpoint);
  if (response.ok) {
    return response.json() as Promise<T>;
  } else {
    const error = await response.text();
    const status = response.status;
    if (status === 404) {
      notFound();
    } else {
      throw Error(
        `mtlsGetItem from ${endpoint} failed with status ${status}: ${error}`
      );
    }
  }
};
