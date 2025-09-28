import NextAuth from "next-auth";
import { authOptions } from "./config";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-assertion
const handler = NextAuth(authOptions) as any;

export { handler as GET, handler as POST };
