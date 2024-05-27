import {
  Box,
  Card,
  Layout,
  Link,
  List,
  Page,
  Text,
  BlockStack,
  useBreakpoints,
  InlineGrid,
  TextField,
  Divider,
  Badge,
  Button,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { Form, json, useLoaderData } from "@remix-run/react";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  const shippingZone = await admin.rest.resources.ShippingZone.all({
    session: session,
  });

  const carrierList = await admin.rest.resources.CarrierService.all({
    session: session,
  }); 

  return json({ data: shippingZone, carrierList: carrierList});
};

export const action = async ({ request }) => { 
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(
      `#graphql
      mutation deliveryProfileUpdate($id: ID!, $profile: DeliveryProfileInput!) {
        deliveryProfileUpdate(id: $id, profile: $profile) {
          profile {
            id
            name
            profileLocationGroups {
              locationGroup {
                id
                locations(first: 5) {
                  nodes {
                    name
                    address {
                      country
                    }
                  }
                }
              }
              locationGroupZones(first: 2) {
                edges {
                  node {
                    zone {
                      id
                      name
                      countries {
                        code {
                          countryCode
                        }
                        provinces {
                          code
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          "id": "gid://shopify/DeliveryProfile/96293421376",
            "profile": {
              "name": "Genaral Profile",
              "locationGroupsToUpdate": [              
                {
                  "id":"gid://shopify/DeliveryLocationGroup/117527445824",
                  "zonesToUpdate": [
                    {
                      "id": "gid://shopify/DeliveryZone/518074696000",
                      "name": "Domestic",
                      "methodDefinitionsToCreate": [
                        {
                          "active": true,
                          "name": "Standard",
                          "priceConditionsToCreate": [
                            {
                              "criteria": {
                                "amount": "500",
                                "currencyCode": "BDT"
                              },
                              "operator": "GREATER_THAN_OR_EQUAL_TO"
                            }
                          ],
                          
                          "participant": {
                            "adaptToNewServices": true,
                            "carrierServiceId": "gid://shopify/DeliveryCarrierService/87549378880",
                            "fixedFee": {
                              "amount": "100",
                              "currencyCode": "BDT"
                            }
                            
                          },
                          
                          "rateDefinition": {
                            "price": {
                              "amount": "100",
                              "currencyCode": "BDT"
                            }
                          }
                        }
                      ]
                    }
                  ]
                }
              ]
            }  
        },
      },
    );
    
  const data = await response.json();
  
  console.log(data);

  return json({ data : "data"})
}

export default function APPSync() {
  const { smUp } = useBreakpoints();
  const { data, carrierList } = useLoaderData();

  console.log(data.data);
  console.log(carrierList.data);
  
  return (
    <Page
      divider
    >
      <BlockStack gap={{ xs: "800", sm: "400" }}>
        <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
          <Box
            as="section"
            paddingInlineStart={{ xs: 400, sm: 0 }}
            paddingInlineEnd={{ xs: 400, sm: 0 }}
          >
            <BlockStack gap="400">
              <Text as="h3" variant="headingMd">
                Shipping Zone
              </Text>
              <Text as="p" variant="bodyMd">
              View and Sync the shipping zones that are set-up within the first location section of your shop's Default Shipping Profile.
              </Text>
            </BlockStack>
          </Box>
          <Card roundedAbove="sm">
            {data.data && data.data.map((zone, index) =>
              <Box key={index}>
                <Text padding="400" as="p" variant="bodyMd">
                  {zone.name}
                    <Badge padding="200" tone={zone.active ? "success" : ""}>{zone.active ? "Connected" : "Not Connected"}</Badge>
                </Text>
                {smUp ? <Divider /> : null}
              </Box>
            )}
            <Form method="POST">
              <Button submit={true}>Sync all rate</Button>
            </Form>
          </Card>
        </InlineGrid>
        {smUp ? <Divider /> : null}
        <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
          <Box
            as="section"
            paddingInlineStart={{ xs: 400, sm: 0 }}
            paddingInlineEnd={{ xs: 400, sm: 0 }}
          >
            <BlockStack gap="400">
              <Text as="h3" variant="headingMd">
                Dimensions
              </Text>
              
            </BlockStack>
          </Box>
          <Card roundedAbove="sm">
            <BlockStack gap="400">
              <TextField label="Horizontal" />
              <TextField label="Interjamb ratio" />
            </BlockStack>
          </Card>
        </InlineGrid>
      </BlockStack>
    </Page>
  )
}

