CREATE TABLE public.esetu_artisans (
  id text PRIMARY KEY,
  name text NOT NULL,
  craft text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  photo text,
  about text NOT NULL DEFAULT '',
  since_year integer,
  languages text[] NOT NULL DEFAULT '{}',
  verified text[] NOT NULL DEFAULT '{}',
  rating numeric NOT NULL DEFAULT 5,
  orders_done integer NOT NULL DEFAULT 0,
  on_time integer NOT NULL DEFAULT 100,
  repeat_buyers integer NOT NULL DEFAULT 0,
  phone text,
  source text NOT NULL DEFAULT 'app',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.esetu_artisans TO anon, authenticated;
GRANT ALL ON public.esetu_artisans TO service_role;
ALTER TABLE public.esetu_artisans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Artisan pages are public" ON public.esetu_artisans FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.esetu_products (
  id text PRIMARY KEY,
  artisan_id text NOT NULL REFERENCES public.esetu_artisans(id) ON DELETE CASCADE,
  title text NOT NULL,
  craft text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  bulk_price numeric NOT NULL DEFAULT 0,
  moq integer NOT NULL DEFAULT 1,
  city text NOT NULL DEFAULT '',
  images text[] NOT NULL DEFAULT '{}',
  description text NOT NULL DEFAULT '',
  materials text NOT NULL DEFAULT '',
  size text NOT NULL DEFAULT '',
  make_days integer NOT NULL DEFAULT 7,
  tags text[] NOT NULL DEFAULT '{}',
  likes integer NOT NULL DEFAULT 0,
  stock integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX esetu_products_artisan_idx ON public.esetu_products (artisan_id);
GRANT SELECT ON public.esetu_products TO anon, authenticated;
GRANT ALL ON public.esetu_products TO service_role;
ALTER TABLE public.esetu_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Marketplace products are public" ON public.esetu_products FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.esetu_orders (
  id text PRIMARY KEY,
  kind text NOT NULL DEFAULT 'single',
  product_id text,
  product_title text NOT NULL DEFAULT '',
  image text,
  artisan_id text,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  buyer_name text NOT NULL DEFAULT '',
  buyer_phone text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  stage text NOT NULL DEFAULT 'placed',
  chosen_artisan_id text,
  tracking_id text,
  courier text,
  expected_days integer NOT NULL DEFAULT 7,
  requirement jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX esetu_orders_artisan_idx ON public.esetu_orders (artisan_id);
CREATE INDEX esetu_orders_phone_idx ON public.esetu_orders (buyer_phone);
GRANT SELECT ON public.esetu_orders TO anon, authenticated;
GRANT ALL ON public.esetu_orders TO service_role;
ALTER TABLE public.esetu_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Orders are readable for tracking" ON public.esetu_orders FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.esetu_order_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text NOT NULL REFERENCES public.esetu_orders(id) ON DELETE CASCADE,
  stage text NOT NULL,
  note text,
  at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX esetu_order_events_order_idx ON public.esetu_order_events (order_id);
GRANT SELECT ON public.esetu_order_events TO anon, authenticated;
GRANT ALL ON public.esetu_order_events TO service_role;
ALTER TABLE public.esetu_order_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Order timeline is public" ON public.esetu_order_events FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.esetu_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text NOT NULL REFERENCES public.esetu_orders(id) ON DELETE CASCADE,
  artisan_id text NOT NULL REFERENCES public.esetu_artisans(id) ON DELETE CASCADE,
  quote numeric NOT NULL DEFAULT 0,
  days integer NOT NULL DEFAULT 7,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (order_id, artisan_id)
);
GRANT SELECT ON public.esetu_responses TO anon, authenticated;
GRANT ALL ON public.esetu_responses TO service_role;
ALTER TABLE public.esetu_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Responses are public" ON public.esetu_responses FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.esetu_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id text NOT NULL REFERENCES public.esetu_artisans(id) ON DELETE CASCADE,
  product_id text,
  buyer_name text NOT NULL DEFAULT '',
  place text NOT NULL DEFAULT '',
  rating integer NOT NULL DEFAULT 5,
  body text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX esetu_reviews_artisan_idx ON public.esetu_reviews (artisan_id);
GRANT SELECT ON public.esetu_reviews TO anon, authenticated;
GRANT ALL ON public.esetu_reviews TO service_role;
ALTER TABLE public.esetu_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are public" ON public.esetu_reviews FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.esetu_artisans (id,name,craft,city,photo,about,since_year,languages,verified,rating,orders_done,on_time,repeat_buyers,source) VALUES ('ramesh-handicrafts','Ramesh Handicrafts','Woodwork & furniture','Jaipur, Rajasthan','/esetu/artisan-ramesh.jpg','Three generations of hand-carved Rajasthani woodwork. Ramesh works mostly in sheesham and oak, and takes on custom furniture sized to a room.',1998,ARRAY['Hindi','English']::text[],ARRAY['Identity','Phone','Workshop address']::text[],4.9,126,98,41,'demo') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.esetu_artisans (id,name,craft,city,photo,about,since_year,languages,verified,rating,orders_done,on_time,repeat_buyers,source) VALUES ('sunita-woodworks','Sunita Woodworks','Furniture, pottery & joinery','Udaipur, Rajasthan','/esetu/artisan-sunita.jpg','A women-led workshop making clean-lined joinery furniture and blue pottery. Known for fast turnarounds and finishes that survive Indian summers.',2009,ARRAY['Hindi','Marathi','English']::text[],ARRAY['Identity','Phone','GST']::text[],4.8,88,96,33,'demo') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.esetu_artisans (id,name,craft,city,photo,about,since_year,languages,verified,rating,orders_done,on_time,repeat_buyers,source) VALUES ('vikram-timber','Vikram Timber Co.','Carving, metal & textiles','Jodhpur, Rajasthan','/esetu/artisan-vikram.jpg','A young workshop taking on detailed carving and metal commissions. Vikram prices keenly and sends progress photos at every stage.',2017,ARRAY['Hindi','Bengali','English']::text[],ARRAY['Identity','Phone']::text[],4.6,53,94,28,'demo') ON CONFLICT (id) DO NOTHING;

INSERT INTO public.esetu_products (id,artisan_id,title,craft,price,bulk_price,moq,city,images,description,materials,size,make_days,tags,likes) VALUES ('blue-pottery-vase','sunita-woodworks','Blue Pottery Vase','Pottery',1850,1490,25,'Jaipur',ARRAY['/esetu/p-vase.jpg','/esetu/product-pottery.jpg','/esetu/p-terracotta.jpg']::text[],'Hand-thrown Jaipur blue pottery vase, painted free-hand with cobalt floral vines and fired twice for a glassy finish. No two pieces are identical.','Quartz clay, cobalt glaze','9 in height, 5 in width',6,ARRAY['vase','blue pottery','home decor','jaipur']::text[],214) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.esetu_products (id,artisan_id,title,craft,price,bulk_price,moq,city,images,description,materials,size,make_days,tags,likes) VALUES ('terracotta-plate-set','sunita-woodworks','Terracotta Dinner Plate Set','Pottery',1200,890,40,'Jaipur',ARRAY['/esetu/p-terracotta.jpg','/esetu/product-pottery.jpg','/esetu/p-vase.jpg']::text[],'A set of four wheel-thrown terracotta plates, sun-dried and kiln-fired. Food safe, keeps rotis warm and gets better with use.','River clay, natural finish','10 in diameter, set of 4',5,ARRAY['plates','terracotta','kitchen','pottery']::text[],168) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.esetu_products (id,artisan_id,title,craft,price,bulk_price,moq,city,images,description,materials,size,make_days,tags,likes) VALUES ('pashmina-shawl','vikram-timber','Handwoven Pashmina Shawl','Textiles',6400,5200,15,'Srinagar',ARRAY['/esetu/p-shawl.jpg','/esetu/p-blockprint.jpg','/esetu/product-textile.jpg']::text[],'Woven on a handloom over eleven days, with a hand-embroidered kani border. Light as breath, warm through a north Indian winter.','Pure pashmina wool, silk thread','80 x 40 in',11,ARRAY['shawl','pashmina','winter','textile']::text[],402) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.esetu_products (id,artisan_id,title,craft,price,bulk_price,moq,city,images,description,materials,size,make_days,tags,likes) VALUES ('bagru-block-print','vikram-timber','Bagru Block Print Fabric','Textiles',950,720,50,'Bagru',ARRAY['/esetu/p-blockprint.jpg','/esetu/product-textile.jpg','/esetu/p-shawl.jpg']::text[],'Indigo block printed cotton, stamped by hand with teakwood blocks and dyed in natural indigo vats. Sold per running metre.','Cotton, natural indigo dye','1 metre x 44 in width',4,ARRAY['fabric','block print','indigo','cotton']::text[],129) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.esetu_products (id,artisan_id,title,craft,price,bulk_price,moq,city,images,description,materials,size,make_days,tags,likes) VALUES ('brass-diya-set','ramesh-handicrafts','Engraved Brass Diya Set','Metalwork',2400,1850,30,'Moradabad',ARRAY['/esetu/p-diya.jpg','/esetu/product-brass.jpg','/esetu/p-dhokra.jpg']::text[],'One standing lamp with four small diyas, hand engraved with lotus borders. A favourite for festival hampers and corporate gifting.','Solid brass, hand engraved','Lamp 7 in, diyas 2.5 in',7,ARRAY['diya','brass','festival','gifting']::text[],311) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.esetu_products (id,artisan_id,title,craft,price,bulk_price,moq,city,images,description,materials,size,make_days,tags,likes) VALUES ('dhokra-figurine','vikram-timber','Dhokra Dancing Lady','Metalwork',3100,2550,20,'Bastar',ARRAY['/esetu/p-dhokra.jpg','/esetu/product-brass.jpg','/esetu/p-diya.jpg']::text[],'Cast in bell metal using the 4,000-year-old lost-wax method. Every thread of the skirt is a rolled wax coil, so each casting is one of one.','Bell metal, lost-wax cast','11 in height',12,ARRAY['dhokra','tribal','sculpture','brass']::text[],275) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.esetu_products (id,artisan_id,title,craft,price,bulk_price,moq,city,images,description,materials,size,make_days,tags,likes) VALUES ('madhubani-painting','vikram-timber','Madhubani Painting on Handmade Paper','Painting',2700,2100,20,'Madhubani',ARRAY['/esetu/p-madhubani.jpg','/esetu/product-textile.jpg','/esetu/p-marble.jpg']::text[],'Peacock and fish motifs painted with natural pigments and a bamboo nib on handmade paper. Unframed, ready to mount.','Handmade paper, natural pigments','16 x 14 in',9,ARRAY['painting','madhubani','folk art','wall']::text[],196) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.esetu_products (id,artisan_id,title,craft,price,bulk_price,moq,city,images,description,materials,size,make_days,tags,likes) VALUES ('jute-tote-bag','sunita-woodworks','Embroidered Jute Tote','Textiles',780,540,100,'Kolkata',ARRAY['/esetu/p-jute.jpg','/esetu/product-textile.jpg','/esetu/p-blockprint.jpg']::text[],'Sturdy woven jute tote with a hand-embroidered flower panel and cotton lining. Popular for retail packaging and event giveaways.','Jute, cotton lining','14 x 13 x 5 in',3,ARRAY['bag','jute','eco','bulk']::text[],143) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.esetu_products (id,artisan_id,title,craft,price,bulk_price,moq,city,images,description,materials,size,make_days,tags,likes) VALUES ('carved-wooden-elephant','ramesh-handicrafts','Hand-carved Wooden Elephant','Woodwork',4300,3600,15,'Jodhpur',ARRAY['/esetu/p-elephant.jpg','/esetu/product-table.jpg','/esetu/product-brass.jpg']::text[],'Carved from a single block of seasoned sheesham, with a jali-work saddle cut by chisel. Finished in beeswax, not lacquer.','Sheesham wood, beeswax finish','10 in height',10,ARRAY['elephant','wood carving','decor','gift']::text[],358) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.esetu_products (id,artisan_id,title,craft,price,bulk_price,moq,city,images,description,materials,size,make_days,tags,likes) VALUES ('bamboo-table-lamp','sunita-woodworks','Woven Bamboo Table Lamp','Bamboo & cane',2200,1700,25,'Agartala',ARRAY['/esetu/p-bamboo.jpg','/esetu/p-jute.jpg','/esetu/product-table.jpg']::text[],'Split bamboo woven over a turned wood base, throwing a diamond pattern of light across the wall. BIS-marked wiring fitted.','Bamboo, mango wood base','17 in height',6,ARRAY['lamp','bamboo','lighting','decor']::text[],231) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.esetu_products (id,artisan_id,title,craft,price,bulk_price,moq,city,images,description,materials,size,make_days,tags,likes) VALUES ('leather-mojari','vikram-timber','Embroidered Leather Mojari','Leather',1650,1250,40,'Jaipur',ARRAY['/esetu/p-mojari.jpg','/esetu/product-textile.jpg','/esetu/p-jute.jpg']::text[],'Vegetable-tanned leather juttis with silk thread embroidery, stitched entirely by hand. Sizes 5 to 11 available.','Vegetable-tanned leather, silk thread','Sizes 5-11',5,ARRAY['mojari','jutti','footwear','leather']::text[],187) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.esetu_products (id,artisan_id,title,craft,price,bulk_price,moq,city,images,description,materials,size,make_days,tags,likes) VALUES ('marble-inlay-coasters','ramesh-handicrafts','Marble Inlay Coaster Set','Stonework',3400,2800,20,'Agra',ARRAY['/esetu/p-marble.jpg','/esetu/p-madhubani.jpg','/esetu/p-vase.jpg']::text[],'Pietra dura inlay in Makrana marble - lapis, carnelian and malachite set by hand into carved channels. Set of six with a stand.','Makrana marble, semi-precious stone','4 in diameter, set of 6',14,ARRAY['coasters','marble','inlay','agra']::text[],264) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.esetu_products (id,artisan_id,title,craft,price,bulk_price,moq,city,images,description,materials,size,make_days,tags,likes) VALUES ('oak-study-table','ramesh-handicrafts','Study Table, Oak','Woodwork',9500,8400,10,'Jaipur',ARRAY['/esetu/product-table.jpg','/esetu/p-elephant.jpg','/esetu/product-brass.jpg']::text[],'A 4 x 2 ft study table in solid oak with two drawers and a walnut finish. Built to order, delivered assembled.','Solid oak, walnut polish','48 x 24 x 30 in',7,ARRAY['table','furniture','study','wood']::text[],98) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.esetu_products (id,artisan_id,title,craft,price,bulk_price,moq,city,images,description,materials,size,make_days,tags,likes) VALUES ('embroidered-wall-art','sunita-woodworks','Embroidered Wall Art','Textiles',2100,1600,25,'Lucknow',ARRAY['/esetu/product-textile.jpg','/esetu/p-blockprint.jpg','/esetu/p-madhubani.jpg']::text[],'Chikankari-inspired hand embroidery on raw cotton, stretched on a wooden frame. Each panel takes about a week at the hoop.','Raw cotton, cotton thread, wood frame','18 x 18 in',7,ARRAY['wall art','embroidery','lucknow','textile']::text[],156) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.esetu_reviews (artisan_id, product_id, buyer_name, place, rating, body) VALUES
 ('ramesh-handicrafts','carved-wooden-elephant','Ananya S.','Bengaluru',5,'The carving is beautiful and the finish is exactly as shown. Packed with care.'),
 ('ramesh-handicrafts','brass-diya-set','Rahul M.','Pune',5,'Bought thirty sets for Diwali gifting. Real handwork, delivered on time.'),
 ('sunita-woodworks','blue-pottery-vase','Fatima K.','Hyderabad',4,'Lovely quality. Delivery took a few extra days but the artisan kept me updated.'),
 ('sunita-woodworks','jute-tote-bag','Deepak R.','Delhi',5,'Strong stitching and the embroidery is neat. Reordering for our store.'),
 ('vikram-timber','pashmina-shawl','Meera J.','Mumbai',5,'Feather light and warm. You can feel the handloom work.');