import { json } from "@remix-run/node";
import db from "../db.server";
import { cors } from "remix-utils";

// get request: accept request with request: customerId, shop, productId.
// read database and return wishlist items for that customer.
export async function loader({ request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  const rateProviderId = url.searchParams.get("rateProviderId");

  if( !shop || !rateProviderId) {
    return json({
      message: "Missing data. Required data: shop",
      method: "GET"
    });
  }

  // If shop is provided, return wishlist items for that Provider.
  const shippingRate = await db.ZoneShippingRate.findMany({
    where: {
      shop: shop,
      rateProviderId: rateProviderId
    },
  });


  const response = json({
    ok: true,
    message: "Success",
    data: shippingRate,
  });

  return cors(request, response);

}


// Expexted data comes from post request. If
// customerID, productID, shop
export async function action({ request }) {
  let data = await request.formData();
  data = Object.fromEntries(data);
  const rateProviderId = data.rateProviderId;
  const zoneId = data.zoneID;
  const rateTitle = data.rateTitle;
  const rateSubtitle = data.rateSubtitle;
  const active = data.active == "false" ? false : true;
  const shop = data.shop;
  const _action = data._action;
  const deletedId = data.deletedId;

  let response;

  switch (_action) {
    case "CREATE":
      // Handle POST request logic here
      // For example, adding a new item to the wishlist
      if(!rateProviderId || !zoneId || !rateTitle || !shop || !_action) {
        return json({
          message: "Missing data. Required data: rateProviderId, zoneId, rateTitle, shop, _action",
          method: _action
        });
      }

      await db.ZoneShippingRate.create({
        data: {
          rateProviderId,
          zoneId,
          rateTitle,
          rateSubtitle,
          active,
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
      await db.ZoneShippingRate.deleteMany({
        where: {
          id: Number(deletedId),
          shop: shop,
        },
      });

      response = json({ message: "Rate Removed from the provider", method: _action});
      return cors(request, response);

    default:
      // Optional: handle other methods or return a method not allowed response
      return new Response("Method Not Allowed", { status: 405 });
  }

}