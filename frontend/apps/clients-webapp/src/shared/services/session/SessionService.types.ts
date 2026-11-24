/** Who is signed in (demo Journeys' mock backend). */
export type Session = { authenticated: true; fullName: string } | { authenticated: false };

/** Session Service — App-shell infrastructure (the site header's account entry). */
export interface SessionService {
  getSession(): Promise<Session>;
}
