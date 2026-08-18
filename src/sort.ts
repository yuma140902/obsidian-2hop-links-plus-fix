import type { TFile } from "obsidian";
import type { PropertiesLinks } from "./model/PropertiesLinks";

const HOUR_IN_MILLISECONDS = 60 * 60 * 1000;

function getHourlySeed(): number {
  return Math.floor(Date.now() / HOUR_IN_MILLISECONDS);
}

interface SortableValue {
  entity?: { sourcePath?: string; linkText?: string };
  twoHopLinkEntity?: {
    link?: { sourcePath?: string; linkText?: string };
  };
  sourcePath?: string;
  linkText?: string;
  path?: string;
  property?: string;
}

function getSortKey(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (value == null || typeof value !== "object") return String(value);

  const sortableValue = value as SortableValue;
  const entity = sortableValue.entity;
  const twoHopLink = sortableValue.twoHopLinkEntity?.link;
  return [
    entity?.sourcePath,
    entity?.linkText,
    twoHopLink?.sourcePath,
    twoHopLink?.linkText,
    sortableValue.sourcePath,
    sortableValue.linkText,
    sortableValue.path,
    sortableValue.property,
  ]
    .filter((part) => part != null)
    .join("\u0000");
}

function seededHash(value: string, seed: number): number {
  let hash = (2166136261 ^ seed) >>> 0;
  for (let i = 0; i < value.length; i++) {
    hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
  }
  return hash >>> 0;
}

function getHourlyRandomComparator() {
  const seed = getHourlySeed();
  return (a: unknown, b: unknown) => {
    const aKey = getSortKey(a);
    const bKey = getSortKey(b);
    const hashDifference = seededHash(aKey, seed) - seededHash(bKey, seed);
    return hashDifference || aKey.localeCompare(bKey);
  };
}

export function getSortFunction(sortOrder: string) {
  const hourlyRandomComparator = getHourlyRandomComparator();
  switch (sortOrder) {
    case "random":
      return hourlyRandomComparator;
    case "filenameAsc":
      return (a: any, b: any) =>
        a.entity && b.entity
          ? a.entity.linkText.localeCompare(b.entity.linkText)
          : hourlyRandomComparator(a, b);
    case "filenameDesc":
      return (a: any, b: any) =>
        a.entity && b.entity
          ? b.entity.linkText.localeCompare(a.entity.linkText)
          : hourlyRandomComparator(a, b);
    case "modifiedDesc":
      return (a: any, b: any) =>
        a.stat && b.stat && a.stat.mtime && b.stat.mtime
          ? b.stat.mtime - a.stat.mtime
          : hourlyRandomComparator(a, b);
    case "modifiedAsc":
      return (a: any, b: any) =>
        a.stat && b.stat && a.stat.mtime && b.stat.mtime
          ? a.stat.mtime - b.stat.mtime
          : hourlyRandomComparator(a, b);
    case "createdDesc":
      return (a: any, b: any) =>
        a.stat && b.stat && a.stat.ctime && b.stat.ctime
          ? b.stat.ctime - a.stat.ctime
          : hourlyRandomComparator(a, b);
    case "createdAsc":
      return (a: any, b: any) =>
        a.stat && b.stat && a.stat.ctime && b.stat.ctime
          ? a.stat.ctime - b.stat.ctime
          : hourlyRandomComparator(a, b);
  }
}

export function getTwoHopSortFunction(sortOrder: string) {
  const hourlyRandomComparator = getHourlyRandomComparator();
  switch (sortOrder) {
    case "random":
      return hourlyRandomComparator;
    case "filenameAsc":
      return (a: any, b: any) =>
        a.twoHopLinkEntity && b.twoHopLinkEntity
          ? a.twoHopLinkEntity.link.linkText.localeCompare(
              b.twoHopLinkEntity.link.linkText,
            )
          : hourlyRandomComparator(a, b);
    case "filenameDesc":
      return (a: any, b: any) =>
        a.twoHopLinkEntity && b.twoHopLinkEntity
          ? b.twoHopLinkEntity.link.linkText.localeCompare(
              a.twoHopLinkEntity.link.linkText,
            )
          : hourlyRandomComparator(a, b);
    case "modifiedDesc":
      return (a: any, b: any) => b.stat.mtime - a.stat.mtime;
    case "modifiedAsc":
      return (a: any, b: any) => a.stat.mtime - b.stat.mtime;
    case "createdDesc":
      return (a: any, b: any) => b.stat.ctime - a.stat.ctime;
    case "createdAsc":
      return (a: any, b: any) => a.stat.ctime - b.stat.ctime;
  }
}

export function getSortFunctionForFile(sortOrder: string) {
  switch (sortOrder) {
    case "random": {
      const seed = getHourlySeed();
      return (file: TFile) => seededHash(file.path, seed);
    }
    case "filenameAsc":
      return (file: TFile) => file.basename;
    case "filenameDesc":
      return (file: TFile) => -file.basename;
    case "modifiedDesc":
      return (file: TFile) => -file.stat.mtime;
    case "modifiedAsc":
      return (file: TFile) => file.stat.mtime;
    case "createdDesc":
      return (file: TFile) => -file.stat.ctime;
    case "createdAsc":
      return (file: TFile) => file.stat.ctime;
  }
}

export async function getSortedFiles(
  files: TFile[],
  sortFunction: (file: TFile) => string | number,
): Promise<TFile[]> {
  const fileEntities: { file: TFile; sortValue: string | number }[] = files.map(
    (file) => {
      return { file, sortValue: sortFunction(file) };
    },
  );
  fileEntities.sort((a, b) => {
    const sortValueA = a.sortValue;
    const sortValueB = b.sortValue;
    if (typeof sortValueA === "string" && typeof sortValueB === "string") {
      return sortValueA.localeCompare(sortValueB);
    } else if (
      typeof sortValueA === "number" &&
      typeof sortValueB === "number"
    ) {
      return sortValueA - sortValueB;
    } else {
      return 0;
    }
  });
  return fileEntities.map((entity) => entity.file);
}

export function getTagHierarchySortFunction(sortOrder: string) {
  const sortFunction = getSortFunction(sortOrder);
  return (a: PropertiesLinks, b: PropertiesLinks) => {
    const aTagHierarchy = a.property.split("/");
    const bTagHierarchy = b.property.split("/");
    for (
      let i = 0;
      i < Math.min(aTagHierarchy.length, bTagHierarchy.length);
      i++
    ) {
      if (aTagHierarchy[i] !== bTagHierarchy[i]) {
        return sortFunction(aTagHierarchy[i], bTagHierarchy[i]);
      }
    }
    if (aTagHierarchy.length !== bTagHierarchy.length) {
      return aTagHierarchy.length > bTagHierarchy.length ? -1 : 1;
    }
    return sortFunction(a.property, b.property);
  };
}
