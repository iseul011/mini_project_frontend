const PARENT_PUBLIC = ['/parent/login', '/parent/signup'] as const;
const PARENT_ONBOARDING = ['/parent/pair', '/parent/onboard'] as const;
const CHILD_PUBLIC = ['/child/pair'] as const;

function startsWithAny(pathname: string, prefixes: readonly string[]) {
  return prefixes.some((p) => pathname.startsWith(p));
}

export function getParentHomePath(onboardDone: boolean) {
  return onboardDone ? '/parent/home' : '/parent/pair';
}

export function getChildHomePath() {
  return '/child/home';
}

export function resolveParentAuthRedirect(
  pathname: string,
  parentLoggedIn: boolean,
  onboardDone: boolean,
): string | null {
  const isPublic = startsWithAny(pathname, PARENT_PUBLIC);
  const isOnboarding = startsWithAny(pathname, PARENT_ONBOARDING);

  if (parentLoggedIn && isPublic) {
    return getParentHomePath(onboardDone);
  }

  if (!parentLoggedIn) {
    return isPublic ? null : '/parent/login';
  }

  if (!onboardDone && !isOnboarding) {
    return '/parent/pair';
  }

  return null;
}

export function resolveChildAuthRedirect(pathname: string, childPaired: boolean): string | null {
  const isPublic = startsWithAny(pathname, CHILD_PUBLIC);

  if (childPaired && pathname.startsWith('/child/pair')) {
    return getChildHomePath();
  }

  if (!childPaired && !isPublic) {
    return '/child/pair';
  }

  return null;
}
