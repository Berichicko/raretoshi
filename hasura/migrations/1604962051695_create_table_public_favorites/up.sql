CREATE TABLE "public"."favorites"("user_id" uuid NOT NULL, "artwork_id" uuid NOT NULL, PRIMARY KEY ("user_id","artwork_id") , FOREIGN KEY ("artwork_id") REFERENCES "public"."artworks"("id") ON UPDATE restrict ON DELETE cascade, FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE restrict ON DELETE cascade);
