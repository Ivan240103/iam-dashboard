// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { retrieveToken } from "@/services/oauth-mtls";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) {
    throw new Error("cannot get authorization code");
  }
  await retrieveToken(code);
  return NextResponse.redirect("https://iam.test.example:8443/ui/mtls");
}
