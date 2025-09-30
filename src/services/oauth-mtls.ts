// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const IAM_AUTHORITY_URL = process.env.IAM_AUTHORITY_URL as string;
const IAM_CLIENT_ID = process.env.IAM_CLIENT_ID as string;
const IAM_CLIENT_SECRET = process.env.IAM_CLIENT_SECRET as string;
const IAM_SCOPES = process.env.IAM_SCOPES as string;
const IAM_REDIRECT_URI = `${IAM_AUTHORITY_URL}/ui/api/mtls/callback`;

export async function decodeJwtPayload(token: string) {
  return JSON.parse(atob(token.split(".")[1]));
}

export async function auth() {
  const cookiesStore = await cookies();
  const accessToken = cookiesStore.get("access_token");
  if (!accessToken) {
    return;
  }
  return accessToken.value;
}

export async function login() {
  const { authorization_endpoint } = await getOpenidConfiguration();
  if (!authorization_endpoint) {
    throw new Error("authorization_endpoint not found");
  }

  redirect(
    authorization_endpoint +
      `?client_id=${IAM_CLIENT_ID}` +
      `&response_type=code` +
      `&redirect_uri=${IAM_REDIRECT_URI}` +
      `&scope=${IAM_SCOPES}`
  );
}

export async function logout() {
  const cookiesStore = await cookies();
  cookiesStore.delete("access_token");
  redirect("/mtls");
}

export async function retrieveToken(code: string) {
  const { token_endpoint } = await getOpenidConfiguration();
  if (!token_endpoint) {
    throw new Error("token_endpoint not found");
  }

  const authorization = Buffer.from(
    `${IAM_CLIENT_ID}:${IAM_CLIENT_SECRET}`
  ).toString("base64");

  const formData = new URLSearchParams();
  formData.append("code", code);
  formData.append("grant_type", "authorization_code");
  formData.append("client_id", IAM_CLIENT_ID);
  formData.append("redirect_uri", IAM_REDIRECT_URI);

  const response = await fetch(token_endpoint, {
    method: "POST",
    body: formData.toString(),
    headers: {
      authorization: `Basic ${authorization}`,
      "content-type": "application/x-www-form-urlencoded",
    }
  });
  const json = await response.json();
  const cookiesStore = await cookies();
  cookiesStore.set("access_token", json["access_token"]);
}

async function getOpenidConfiguration() {
  const wellKnownEndpoint = `${IAM_AUTHORITY_URL}/.well-known/openid-configuration`;
  const response = await fetch(wellKnownEndpoint);
  return response.json();
}
