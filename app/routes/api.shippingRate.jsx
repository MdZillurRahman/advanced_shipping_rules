import { json } from "@remix-run/node";
import db from "../db.server";
import { cors } from "remix-utils";

// get request: accept request with request: customerId, shop, productId.
// read database and return wishlist items for that customer.
export async function loader({ request }) {
  const url = new URL(request.url);
  // const customerId = url.searchParams.get("customerId");
  // const shop = url.searchParams.get("shop");
  // const productId = url.searchParams.get("productId");
  
  let wishlist = []


  // if(!customerId || !shop || !productId) {
  //   return json({
  //     message: "Missing data. Required data: customerId, productId, shop",
  //     method: "GET"
  //   });
  // }

  // If customerId, shop, productId is provided, return wishlist items for that customer.
  // const wishlist = await db.wishlist.findMany({
  //   where: {
  //     customerId: customerId,
  //     shop: shop,
  //     productId: productId,
  //   },
  // });


  const response = json({
    ok: true,
    message: "Success",
    data: wishlist,
  });

  return cors(request, response);

}


// Expexted data comes from post request. If
// customerID, productID, shop
export async function action({ request }) {
  let data = await request.formData();
  data = Object.fromEntries(data);
  console.log(data);
  const zoneId = data.zoneID;
  const rateTitle = data.rateTitle;
  const rateSubtitle = data.rateSubtitle;
  const shop = data.shop;
  const _action = data._action;

  if(!zoneId || !rateTitle || !shop || !_action) {
    return json({
      message: "Missing data. Required data: zoneId, rateTitle, shop, _action",
      method: _action
    });
  }

  let response;

  switch (_action) {
    case "CREATE":
      // Handle POST request logic here
      // For example, adding a new item to the wishlist
      await db.ZoneShippingRate.create({
        data: {
          zoneId,
          rateTitle,
          rateSubtitle,
          shop,
        },
      });

      response = json({ message: "Rate added to the provider", method: _action});
      return cors(request, response);

    case "PATCH":
      // Handle PATCH request logic here
      // For example, updating an existing item in the wishlist
      return json({ message: "Success", method: "Patch" });

    case "DELETE":
      // Handle DELETE request logic here (Not tested)
      // For example, removing an item from the wishlist
      await db.wishlist.deleteMany({
        where: {
          zoneId: zoneId,
          shop: shop,
          rateTitle: rateTitle,
        },
      });

      response = json({ message: "Rate Removed from the provider", method: _action});
      return cors(request, response);

    default:
      // Optional: handle other methods or return a method not allowed response
      return new Response("Method Not Allowed", { status: 405 });
  }

}