export interface SearchableMember {
  name?: string;
  email?: string;
}

export function normalizeMemberSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLocaleLowerCase("vi-VN")
    .trim();
}

export function matchesMemberSearch(
  member: SearchableMember | undefined,
  query: string,
) {
  const normalizedQuery = normalizeMemberSearch(query);
  if (!normalizedQuery) return true;

  return normalizeMemberSearch(
    `${member?.name || ""} ${member?.email || ""}`,
  ).includes(normalizedQuery);
}
