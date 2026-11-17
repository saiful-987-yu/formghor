# শেয়ার ছবি (OG ছবি)

ফেসবুক, হোয়াটসঅ্যাপ ইত্যাদিতে কোনো ফর্মের লিংক শেয়ার করলে যে ছবির প্রিভিউ দেখা যায়, সেই ছবিগুলো এই ফোল্ডারের।

## এই ফোল্ডারে ছবি নেই কেন
- জিপ ফাইল হালকা রাখতে ছবিগুলো ইচ্ছা করেই জিপে দেওয়া হয় না। ছবিগুলো ডেভেলপারের কাছে আছে এবং GitHub-এ আলাদাভাবে আপলোড করা হয়।
- জিপে শুধু নমুনা হিসেবে এক-দুটো ছবি থাকে (এখন `oikkya-member-apply.png`)। বাকিগুলো না থাকা মানে ছবি নেই তা নয়।
- ছবি না থাকলে সাইটের কোনো কাজ আটকায় না। শুধু শেয়ার প্রিভিউতে ছবি আসে না।
- তাই এই ছবিগুলো নতুন করে বানাতে বা জিপে যোগ করতে হবে না, ডেভেলপার না বললে।

## নিয়ম
- ফাইলের নাম `<slug>.png`, মাপ ১২০০×৬৩০ পিক্সেল, PNG।
- প্রতিটা ফর্ম পেজের `og:image` ও `twitter:image` ট্যাগে এই পাথ আগে থেকেই বসানো আছে: `https://saiful-987-yu.github.io/formghor/assets/og/<slug>.png`। তাই ছবি এই ফোল্ডারে ঠিক নামে রাখলেই কাজ করে, কোড বদলাতে হয় না।
- নতুন ফর্ম যোগ করলে একই নামের নিয়মে (`<slug>.png`) একটা ছবি বানাতে হবে।

## নকশা
- কালো ব্যাকগ্রাউন্ডে হালকা গ্রিড। বাঁয়ে ফর্মঘরের লোগো, নাম ও ট্যাগলাইন; মাঝখানে ওই ফর্মের আসল ডেমো ২-এর প্রিভিউ (`assets/previews/<slug>.webp`, হোমের কার্ডের ছবির মতো); ডানে ফর্মের ইংরেজি নাম (`forms/registry.js`-এর `title.en`)।
- মাঝের প্রিভিউ সর্বোচ্চ প্রায় ৪৫০×৫৪০ পিক্সেলের ঘরের ভেতরে নিজে ফিট হয়, লম্বা কাগজ বা আড়াআড়ি কার্ড সব ধরনের জন্য।
- ফর্মের ডিজাইন বা ডেমো ২ বদলালে প্রিভিউ আবার বানিয়ে এই ছবিও নতুন করে বানাতে হবে।
- ছবি বানানোর স্ক্রিপ্ট `tools/make-og.py` (ব্র্যান্ডের অংশ `tools/og-brand.png`)। চালানোর নিয়ম: `python3 tools/make-og.py` দিলে সব ফর্মের ছবি `tools/og-output/` ফোল্ডারে তৈরি হয়; নির্দিষ্ট ফর্মের জন্য শেষে slug দিন, যেমন `python3 tools/make-og.py cv-sidebar`; অন্য ফোল্ডারে চাইলে `--out ফোল্ডার`। Pillow, numpy ও Inter Bold ফন্ট লাগে (ফন্ট অন্য জায়গায় থাকলে `OG_FONT=/পাথ/Inter-Bold.otf`)। আউটপুট ছবিগুলো জিপে রাখার দরকার নেই।
- ছবি বদলে GitHub-এ দিলেও ফেসবুক পুরোনো ছবি ক্যাশ করে রাখতে পারে; Facebook Sharing Debugger-এ লিংক দিয়ে রিফ্রেশ করলে নতুন ছবি আসে।

## ছবির তালিকা (১৮টি)

| ফাইল | ফর্ম | ইংরেজি নাম |
|---|---|---|
| `cv-sidebar.png` | সাইডবার সিভি | Sidebar CV |
| `cv-classic.png` | ক্লাসিক সিভি | Classic CV |
| `cv-modern.png` | মডার্ন সিভি | Modern CV |
| `resume.png` | রেজুমি (এক পাতা) | Resume (one page) |
| `cv-green.png` | গ্রিন সিভি (এক পাতা) | Green CV (one page) |
| `office-id-card.png` | অফিস আইডি কার্ড | Office ID card |
| `office-id-maroon.png` | মেরুন অফিস আইডি কার্ড | Maroon office ID card |
| `school-id-card.png` | স্কুল / মাদ্রাসা আইডি কার্ড | School / madrasa ID card |
| `school-id-card-2.png` | স্কুল / মাদ্রাসা আইডি কার্ড (আড়াআড়ি) | School / madrasa ID card (landscape) |
| `teacher-id-card.png` | শিক্ষক আইডি কার্ড | Teacher ID card |
| `personal-card.png` | ব্যক্তিগত ভিজিটিং কার্ড | Personal visiting card |
| `nid-info-card.png` | NID তথ্য কার্ড (নমুনা) | NID information card (sample) |
| `plot-sale-deed.png` | ভিটা ক্রয়ের স্ট্যাম্প দলিল | Plot purchase stamp deed |
| `school-apply.png` | স্কুলে ভর্তির আবেদন | School admission application |
| `union-member-apply.png` | ইউনিয়নের সদস্য আবেদন ফরম | Union membership application |
| `oikkya-member-apply.png` | ঐক্য বিজনেস গ্রুপ সদস্য আবেদন ফরম | Oikkya Business Group member application |
| `oikkya-deposit-receipt.png` | টাকা জমা ও কিস্তি প্রাপ্তি রসিদ | Deposit and instalment receipt |
| `business-card.png` | বিজনেস কার্ড (দোকান ও কাস্টমার) | Business card (shop and customer) |

এছাড়া `assets/og-image.png` হলো হোম, প্রোফাইল, ফেভারিট ও সেভ করা ফর্ম পেজের সাধারণ শেয়ার ছবি (এই ফোল্ডারের বাইরে)।
