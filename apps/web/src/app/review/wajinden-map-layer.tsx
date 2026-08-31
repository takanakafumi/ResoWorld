import eastAsia from "@/domain/geography/east-asia-110m.geo.json";
import { projectLensPreset } from "@/domain/lens-packs/projection";
import { wajindenRoutesPack } from "@/domain/lens-packs/seed-packs";

import styles from "./atlas.module.css";

type Point = { x: number; y: number };
type Project = (latitude: number, longitude: number) => Point;
type Ring = number[][];

const projection = projectLensPreset(wajindenRoutesPack, "wajinden-comparison");
const entityById = new Map(projection.nodes.map((entity) => [entity.id, entity]));
const sourceRoute = [
  "guya-korea",
  "tsushima-state",
  "iki-state",
  "matsuro-state",
  "ito-state",
  "na-state",
  "fumi-state",
];

function identifiedPlaces(entityId: string) {
  return projection.edges
    .filter(
      (edge) =>
        edge.subjectId === entityId && edge.relationFamily === "identification",
    )
    .map((edge) => entityById.get(edge.objectId))
    .filter((entity) => entity?.coordinates);
}

export const wajindenMapPlaces = projection.nodes.filter(
  (entity) => entity.coordinates,
);

function ringPath(ring: Ring, project: Project) {
  return ring
    .map(([longitude, latitude], index) => {
      const point = project(latitude, longitude);
      return `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
    })
    .join(" ") + " Z";
}

function geometryPath(
  geometry: { type: string; coordinates: unknown },
  project: Project,
) {
  if (geometry.type === "Polygon") {
    return (geometry.coordinates as Ring[])
      .map((ring) => ringPath(ring, project))
      .join(" ");
  }
  return (geometry.coordinates as Ring[][])
    .flatMap((polygon) => polygon.map((ring) => ringPath(ring, project)))
    .join(" ");
}

function linePath(
  entities: typeof projection.nodes,
  project: Project,
) {
  return entities
    .filter((entity) => entity.coordinates)
    .map((entity, index) => {
      const point = project(
        entity.coordinates!.latitude,
        entity.coordinates!.longitude,
      );
      return `${index === 0 ? "M" : "L"}${point.x} ${point.y}`;
    })
    .join(" ");
}

export function WajindenMapLayer({ project }: { project: Project }) {
  const mainPlaces = sourceRoute
    .map((id) => identifiedPlaces(id)[0])
    .filter((entity): entity is NonNullable<typeof entity> => Boolean(entity));
  const fumiPlace = mainPlaces.at(-1);
  const kyushu = entityById.get("northern-kyushu");
  const kinai = entityById.get("nara-basin");
  const branchStart = fumiPlace ? [fumiPlace] : [];

  return (
    <g className={styles.wajindenMapLayer}>
      <g aria-label="Natural Earthによるローカル背景地図">
        {eastAsia.features.map((feature) => (
          <path
            key={feature.properties.ADMIN}
            d={geometryPath(feature.geometry, project)}
            className={styles.actualLand}
          />
        ))}
      </g>
      <text x="128" y="104" className={styles.mapCountryLabel}>KOREAN PENINSULA</text>
      <text x="685" y="154" className={styles.mapCountryLabel}>JAPAN</text>

      <path d={linePath(mainPlaces, project)} className={styles.wajindenSourceRouteHalo} />
      <path d={linePath(mainPlaces, project)} className={styles.wajindenSourceRoute} />
      {kyushu ? <path d={linePath([...branchStart, kyushu], project)} className={styles.wajindenKyushuRoute} /> : null}
      {kinai ? <path d={linePath([...branchStart, kinai], project)} className={styles.wajindenKinaiRoute} /> : null}

      {mainPlaces.map((place, index) => {
        const point = project(place.coordinates!.latitude, place.coordinates!.longitude);
        return (
          <g key={place.id} transform={`translate(${point.x} ${point.y})`} className={styles.wajindenMapMarker}>
            <circle r="7" />
            <text y={index % 2 === 0 ? -14 : 22} textAnchor="middle">{place.label.replace("周辺", "")}</text>
          </g>
        );
      })}
      {[kyushu, kinai].filter((entity): entity is NonNullable<typeof entity> => Boolean(entity)).map((place) => {
        const point = project(place.coordinates!.latitude, place.coordinates!.longitude);
        const kind = place.id === "nara-basin" ? "kinai" : "kyushu";
        return (
          <g key={place.id} transform={`translate(${point.x} ${point.y})`} className={styles.wajindenHypothesisMarker} data-kind={kind}>
            <circle r="11" />
            <text y="-18" textAnchor="middle">{kind === "kinai" ? "畿内説" : "九州説"}</text>
          </g>
        );
      })}
    </g>
  );
}
