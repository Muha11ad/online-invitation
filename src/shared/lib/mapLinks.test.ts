import { describe, expect, it } from "vitest";
import { buildYandexGoUrl, buildYandexMapsUrl, buildYandexNavigatorUrl } from "./mapLinks";

describe("buildYandexMapsUrl", () => {
  it("places lon before lat in pt and includes zoom", () => {
    const url = buildYandexMapsUrl(55.75, 37.62, 16);
    const params = new URL(url).searchParams;
    expect(url.startsWith("https://yandex.ru/maps/?")).toBe(true);
    expect(params.get("pt")).toBe("37.62,55.75");
    expect(params.get("z")).toBe("16");
  });

  it("defaults zoom to 16 when omitted", () => {
    const url = buildYandexMapsUrl(55.75, 37.62);
    expect(new URL(url).searchParams.get("z")).toBe("16");
  });
});

describe("buildYandexGoUrl", () => {
  it("encodes destination coordinates and a default ref", () => {
    const url = buildYandexGoUrl(55.75, 37.62);
    const params = new URL(url).searchParams;
    expect(url.startsWith("https://3.redirect.appmetrica.yandex.com/route?")).toBe(true);
    expect(params.get("end-lat")).toBe("55.75");
    expect(params.get("end-lon")).toBe("37.62");
    expect(params.get("ref")).toBe("wedding-invite");
    expect(params.get("appmetrica_tracking_id")).toBe("1178268795219780156");
  });

  it("accepts a custom ref", () => {
    const url = buildYandexGoUrl(55.75, 37.62, "my-site");
    expect(new URL(url).searchParams.get("ref")).toBe("my-site");
  });
});

describe("buildYandexNavigatorUrl", () => {
  it("builds a show_point_on_map deep link with lat/lon/zoom", () => {
    const url = buildYandexNavigatorUrl(55.75, 37.62, 16);
    expect(url.startsWith("yandexnavi://show_point_on_map?")).toBe(true);
    const params = new URL(url).searchParams;
    expect(params.get("lat")).toBe("55.75");
    expect(params.get("lon")).toBe("37.62");
    expect(params.get("zoom")).toBe("16");
  });

  it("defaults zoom to 16 when omitted", () => {
    const url = buildYandexNavigatorUrl(55.75, 37.62);
    expect(new URL(url).searchParams.get("zoom")).toBe("16");
  });
});
