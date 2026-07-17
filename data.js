/* ============================================================
   Pod Timeline — seed data
   ------------------------------------------------------------
   This is a transcription of the "Pod Timeline" Google Sheet
   (columns: Year · Exact Date · Person · Event Type · Location ·
   Type · Related People · Notes · Photo). It is only the bootstrap
   data: once a public Google Sheets link is connected in Settings,
   the entire app is rebuilt from that sheet and this file is ignored.

   Notes ending in "…" were cut off at the edge of the source
   photo — connect the sheet to get the full text.

   A moment's `photo` is a URL (the sheet's Photo column) or an
   object { src, w, h } — the dimensions keep layouts steady while
   the image loads. The ones below are placeholders until the real
   pictures are dug out of everyone's camera rolls.
   ============================================================ */

window.POD_SEED = [
  { y: 2012, yq: true, d: "June", person: "Melissa Torrey", type: "Romance", loc: "Salt Lake City, UT", scope: "Pod", rel: ["Brandon Strong"],
    note: "FIRST KISS. Brandon kisses Mels at the airport when leaving back to Austin.",
    photo: { src: "https://picsum.photos/seed/pod-first-kiss/1200/900", w: 1200, h: 900 } },

  { y: 2012, yq: true, d: "June", person: "Melissa Torrey", type: "Romance", loc: "Salt Lake City, UT", scope: "Pod", rel: ["Brandon Strong"],
    note: "Mels talks with therapist about what she should do, they say should break up but not be with any…" },

  { y: 2012, d: "07/22/2012", person: "Melissa Torrey", type: "Romance", loc: "Salt Lake City, UT", scope: "Pod", rel: ["Brandon Strong"],
    note: "OFFICIAL TOGETHER. Brandon comes back to visit. They have dinner with his family. They kiss…" },

  { y: 2012, yq: true, person: "Melissa Torrey", type: "Core", loc: "Anaheim, CA", scope: "Self", rel: ["Brandon Strong"],
    note: "First Disney with Strong Family" },

  { y: 2012, yq: true, person: "Melissa Torrey", type: "Core", loc: "Orlando, FL", scope: "Self", rel: ["Brandon Strong"],
    note: "First Disney World" },

  { y: 2012, person: "Stephanie Schuhmacher", type: "Core", loc: "Paris, France", scope: "Self", rel: [],
    note: "First international solo trip. 2 week trip. Kept a Tumblr travel blog called “I’m in France, Bitch”…",
    photo: { src: "https://picsum.photos/seed/pod-paris-solo/900/1200", w: 900, h: 1200 } },

  { y: 2012, yq: true, d: "November–December", person: "Brandon Strong", type: "Relationship", loc: "Salt Lake City, UT", scope: "Pod", rel: [],
    note: "Brandon lives with Mels for 2 months." },

  { y: 2012, d: "12/10/2012", person: "Stephanie Schuhmacher", type: "Core", loc: "Austin, TX", scope: "Self", rel: [],
    note: "Remodel from hell. Started tumblr mydamnhouse, attorney made me take it down. Sellers had co…" },

  { y: 2012, d: "12/17/2012", person: "Melissa Torrey", type: "Core", loc: "Anaheim, CA", scope: "Self", rel: ["Brandon Strong"],
    note: "First Disneyland Brandon",
    photo: { src: "https://picsum.photos/seed/pod-disneyland/1200/800", w: 1200, h: 800 } },

  { y: 2012, yq: true, d: "December", person: "Clark and Angie", type: "Meeting", scope: "Pod", rel: ["Kiira Decoster"],
    note: "Clark had photo of Kiira Dec 2012" },

  { y: 2013, d: "March", person: "Tom Ivey", type: "Meeting", loc: "Austin, TX", scope: "Pod", rel: ["Brandon Strong"],
    note: "Met/Hired Brandon" },

  { y: 2013, d: "03/19/2013", person: "Tom Ivey", type: "Work", loc: "Austin, TX", scope: "Self", rel: [],
    note: "Resigned from Retro" },

  { y: 2014, yq: true, d: "May", person: "Melissa Torrey", type: "Move", loc: "Austin, TX", scope: "Pod", rel: [],
    note: "Moved to Austin for new job… and Brandon? *shrug*" },

  { y: 2014, yq: true, d: "May", person: "Melissa Torrey", type: "Move", loc: "Austin, TX", scope: "Self", rel: [],
    note: "First Austin job at Gatehouse Media, which became USA Today Co. Same place she’s still at." },

  { y: 2014, d: "A few months after moving", person: "Melissa Torrey", type: "Friendship", loc: "Austin, TX", scope: "Pod", rel: ["Matt Manchester"],
    note: "Mels and Matt meet. But where??? Probably at a Hideout event." },

  { y: 2014, d: "10/11/2014", person: "Melissa Torrey", type: "Friendship", loc: "Austin, TX", scope: "Pod", rel: ["Matt Manchester"],
    note: "Big camping trip with a bunch of Retro people. Matt gets everyone to be naked – “wouldn’t it be fu…”",
    photo: { src: "https://picsum.photos/seed/pod-camping/1600/1000", w: 1600, h: 1000 } },

  { y: 2015, d: "06/01/2015", person: "Tom Ivey", type: "Friendship", loc: "Austin, TX", scope: "Pod", rel: ["Brandon Strong"],
    note: "Facebook friends June 2015" },

  { y: 2015, d: "09/07/2015", person: "Matt Manchester", type: "Friendship", loc: "Austin, TX", scope: "Pod", rel: ["Sophia Spera"],
    note: "River float trip where Matt remeets Sophia",
    photo: { src: "https://picsum.photos/seed/pod-river-float/1200/900", w: 1200, h: 900 } },

  { y: 2015, d: "09/15/2015", person: "Melissa Torrey", type: "Friendship", loc: "Austin, TX", scope: "Pod", rel: ["Sophia Spera"],
    note: "Melissa meets Sophia at Godspeed You! Black Emperor concert at the Mohawk",
    photo: { src: "https://picsum.photos/seed/pod-mohawk-show/1000/1000", w: 1000, h: 1000 } },

  { y: 2015, d: "09/15/2015", person: "Brandon Strong", type: "Friendship", loc: "Austin, TX", scope: "Pod", rel: ["Sophia Spera"],
    note: "Brandon meets Sophia at Godspeed You! Black Emperor concert at the Mohawk" },

  { y: 2016, d: "02/27/2016", person: "Tom Ivey", type: "Friendship", loc: "Austin, TX", scope: "Pod", rel: ["Sophia Spera"],
    note: "Definitely met Sophia on or before 02/27/2016 (some kind of 4th of July party at their house, Sophia dressed as Statue of Liberty). This is ONE HUNDRED PERCENT when I met Mi…" },

  { y: 2016, person: "Tom Ivey", scope: "Pod", rel: ["Sophia Spera", "Mitzi"],
    note: "We were doing Dinner nights with a group of people minimally at 04/23/2016." },

  { y: 2016, person: "Tom Ivey", scope: "Pod", rel: ["Brandon Strong", "Melissa Torrey"],
    note: "Anyone that was at 2016 Halloween party where John Sheblak dressed up as Sean Horton" },

  { y: 2016, d: "July", person: "Clark and Angie", type: "Meeting", scope: "Pod", rel: ["Matt Manchester"],
    note: "Clark has photo of Matt July 2016" },

  { y: 2017, d: "02/05/2017", person: "Tom Ivey", scope: "Pod", rel: ["Tilly"],
    note: "Was Tilly at the dachshund meetup Sophia invited me to? A picture with a dog that looks like her" },

  { y: 2017, d: "04/30/2017", person: "Tom Ivey", scope: "Pod", rel: ["Claire Spera"],
    note: "Definitely knew Claire by at least this date, Dachshund races in Buda" },

  { y: 2017, d: "07/01/2017", person: "Tom Ivey", type: "Friendship", loc: "Buda, TX", scope: "Pod", rel: ["Claire Spera"],
    note: "Facebook friends July 2017" },

  { y: 2017, person: "Stephanie Schuhmacher", type: "Relationship", loc: "Austin, TX", scope: "Self", rel: ["Melissa Torrey"],
    note: "Got Married to Andy. Immediate f…",
    photo: { src: "https://picsum.photos/seed/pod-wedding/1000/1250", w: 1000, h: 1250 } },
];
