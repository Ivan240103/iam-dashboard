// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import { auth, decodeJwtPayload, login, logout } from "@/services/oauth-mtls";
import { getUsersPageMtls } from "@/services/users-mtls";

export default async function MutualTLS() {
  const session = await auth();
  const loggedIn = !!session;
  const decodedAccessToken = loggedIn ? await decodeJwtPayload(session) : undefined;
  const username = decodedAccessToken?.name;
  const welcomeMessage = username ? `Hello ${username}!` : "Welcome";

  const users = loggedIn ? await getUsersPageMtls(10) : undefined

  return (
    <div className="font-sans">
      <main className="w-fit mx-auto flex flex-col justify-between p-32 text-center">
        <h1>{welcomeMessage}</h1>
        <form action={loggedIn ? logout : login} className="mx-auto">
          <button className="border border-gray-300 rounded px-6 py-2 my-8 cursor-pointer" type="submit">
            {loggedIn ? "Logout" : "Login"}
          </button>
        </form>
        {loggedIn && <p>{decodedAccessToken.client_id}</p>}
        {users && <>
          <h2 className="my-4">First 10 users</h2>
          {users.Resources.map(u => 
            <p key={u.id}>{u.displayName}</p>
          )}
        </>}
      </main>
    </div>
  );
}
