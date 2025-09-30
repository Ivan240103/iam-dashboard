// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

"use server";

import { settings } from "@/config";
import { Paginated } from "@/models/pagination";
import { User } from "@/models/scim";
import { mtlsGetItem } from "@/utils/fetch-mtls";

const { BASE_URL } = settings;

export async function getUsersPageMtls(
  count: number,
  startIndex: number = 1,
  filter?: string
) {
  let url = `${BASE_URL}/iam/account/search?count=${count}&startIndex=${startIndex}`;
  if (filter) {
    url += `&filter=${filter}`;
  }
  return await mtlsGetItem<Paginated<User>>(url);
}
