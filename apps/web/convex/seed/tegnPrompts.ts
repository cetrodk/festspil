import { mutation } from "../_generated/server";

export const seedTegnPrompts = mutation({
  handler: async (ctx) => {
    // Clear existing tegn prompts first
    const existing = await ctx.db
      .query("prompts")
      .withIndex("by_game", (q) => q.eq("gameType", "tegn"))
      .collect();
    await Promise.all(existing.map((p) => ctx.db.delete(p._id)));

    const words = [
      // Sjove situationer
      "bedstemor på rulleskøjter",
      "et spøgelse der er bange",
      "en viking der tager selfie",
      "wifi signalet er dårligt",
      "en kat der styrer verden",
      "en haj på ferie",
      "en pizza der løber væk",
      "en robot der er forelsket",
      "en ko på skateboard",
      "en ninja i supermarkedet",
      "en klovn der græder",
      "en hund der kører bil",
      "en dinosaur til jobsamtale",
      "en pingvin i saunaen",
      "en drage der er bange for ild",
      "en astronaut der har glemt sin madpakke",
      "mandag morgen",
      "en enhjørning med tømmermænd",
      "en pirat der er søsyg",
      "en snegl i formel 1",
      "en brandmand der er bange for ild",
      "et monster under sengen der er bange",
      "en havfrue på cykel",
      "en troldmand der har glemt sine trylleord",
      "en superhelt med dårlig ryg",
      "en abe der tager til eksamen",
      "en elefant der gemmer sig",
      "en detektiv der ikke kan finde sine briller",
      "en vampyr der er vegetar",
      "en alien der prøver dansk mad",
      // Genkendelige ting
      "at stå i kø i Bilka",
      "at træde på en Lego",
      "når telefonen dør midt i en besked",
      "at forsøge at folde et kort sammen",
      "rengøringsdagen",
      "den første kop kaffe",
      "at finde parkeringsplads",
      "at prøve at fange en flue",
      "at vente på bussen i regnvejr",
      "at glemme hvad man kom ind i rummet for",
      // Absurde ting
      "en guldfisk der går tur med sin hund",
      "et træ der løber maraton",
      "en sky der er jaloux",
      "en gaffel der er forelsket i en ske",
      "en dør der ikke vil lukke op",
      "en stol der er træt af at sidde",
      "et spejlæg med attitude",
      "en kaktus der vil krammes",
      "en banan i jakkesæt",
      "en tallerken der er sulten",
    ];

    for (const text of words) {
      await ctx.db.insert("prompts", {
        gameType: "tegn",
        text,
      });
    }

    return { inserted: words.length };
  },
});
