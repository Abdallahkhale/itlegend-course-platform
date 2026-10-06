# Asset attribution

- **Player poster:** the exact instructor photograph recovered from the publicly viewable [supplied Figma reference](https://www.figma.com/design/M6RfSjHqm6glEN1BQR1WFl/ITLegend-Course-Player-Page-Test?node-id=0-1&p=f), cropped to its 400×267 photo region and encoded as WebP. The supplied screenshot already includes darkening and a play circle; an opaque, functional play control covers that circle. No second dark overlay is added.
- **Six catalog photos:** the original [EduBlink public course catalog](https://edublink.react.devsblink.com/course-style-1), `/assets/images/course/course-01/course-01.jpg` through `course-06.jpg`, converted to WebP.
- **Comment/leaderboard portraits:** the matching EduBlink reference assets, `/assets/images/blog/comment-01.jpg` through `comment-03.jpg`, converted to WebP. Photographs remain the property of their respective owners and are included to reproduce the challenge reference.
- **Body font:** [Poppins](https://github.com/google/fonts/tree/main/ofl/poppins), four self-hosted Latin WOFF2 weights. The SIL Open Font License is included at `public/fonts/Poppins-OFL.txt`.
- **Heading font:** [Spartan](https://fonts.google.com/specimen/Spartan), a self-hosted variable WOFF2 file identified by the original template font CSS. Its SIL Open Font License is included at `public/fonts/Spartan-OFL.txt`.
- **Sample MP4:** [MDN’s video element example](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video), downloaded from `https://developer.mozilla.org/shared-assets/videos/flower.mp4`. This short silent sample demonstrates actual video behavior; it is not a course recording. The English caption track describes that silent sample.
- **PDF:** original one-page SEO Practice Workbook created for this demonstration, rendered and visually verified before integration.
- **Icons:** [Lucide](https://lucide.dev/), ISC license, used for functional interface controls. The simple favicon uses the course player’s teal color and play motif.

The player uses the reference’s Poppins/Spartan typefaces, `#f5f9fa` heading surface, `#181818` headings, `#e5e5e5` borders, and teal/coral accents. Some small text and filled action colors use darker variants to meet contrast requirements.
