import { Form, json, useLoaderData, useSubmit } from "@remix-run/react";
import {
    Box,
    Card,
    Layout,
    Link,
    List,
    Page,
    Text,
    BlockStack,
    Button,
    Label,
    FormLayout,
    Bleed,
    Frame,
    Modal,
    TextContainer,
    TextField,
    ButtonGroup,
} from "@shopify/polaris";
import {PlusIcon} from '@shopify/polaris-icons';
import { authenticate } from "../shopify.server";
import { useCallback, useState } from "react";

export const loader = async ({ request }) => {
    const { admin, session } = await authenticate.admin(request);
  
    const shippingZone = await admin.rest.resources.ShippingZone.all({
      session: session,
    });

    const carrierList = await admin.rest.resources.CarrierService.all({
        session: session,
    });

    const alreadyExist = carrierList.data.some(list => list.name.includes("Shipping Rate Provider"));

    if (!alreadyExist) {
        const carrier_service = new admin.rest.resources.CarrierService({session: session});

        carrier_service.name = "Shipping Rate Provider";
        carrier_service.callback_url = "http://shipping.example.com";
        carrier_service.service_discovery = true;
        await carrier_service.save({
            update: true,
        });
    };    
  
    return json({ data: shippingZone, carrierList: carrierList});
};

export const action = async ({ request }) => { 
    // Get the form data from the request
  let settings = await request.formData();
  settings = Object.fromEntries(settings);

  let appUrl = "https://clusters-grave-management-rotation.trycloudflare.com";

  // Use the `get` method to get the value of the form field
  var formdata = new FormData();
  formdata.append("zoneID", settings?.zone);
  formdata.append("rateTitle", settings?.title);
  formdata.append("rateSubtitle", settings?.subTitle);
  formdata.append("shop", "entry-try-shop.myshopify.com");
  formdata.append("_action", "CREATE");

  console.log(formdata);
  
  var requestOptions = {
    method: 'POST',
    body: formdata,
    redirect: 'follow'
  };

  // You can use newUser to create a new user in your database
  fetch(appUrl + "/api/shippingRate", requestOptions)
        .then(response => response.json())
        .then(result => {
            console.log(result);
        })
        .catch(error => console.log('error', error));

  // Redirect to the user page
  return json(formdata);
    // return {data: newUser};
}

// const addRule = async ({ request }) => {
//   const { admin } = await authenticate.admin(request);

//   console.log(request);

//   const response = await admin.graphql(
//       `#graphql
//       mutation deliveryProfileUpdate($id: ID!, $profile: DeliveryProfileInput!) {
//         deliveryProfileUpdate(id: $id, profile: $profile) {
//           profile {
//             id
//             name
//             profileLocationGroups {
//               locationGroup {
//                 id
//                 locations(first: 5) {
//                   nodes {
//                     name
//                     address {
//                       country
//                     }
//                   }
//                 }
//               }
//               locationGroupZones(first: 2) {
//                 edges {
//                   node {
//                     zone {
//                       id
//                       name
//                       countries {
//                         code {
//                           countryCode
//                         }
//                         provinces {
//                           code
//                         }
//                       }
//                     }
//                   }
//                 }
//               }
//             }
//           }
//           userErrors {
//             field
//             message
//           }
//         }
//       }`,
//       {
//         variables: {
//           "id": "gid://shopify/DeliveryProfile/96293421376",
//           "profile": {
//             "name": "Genaral Profile",
//             "locationGroupsToUpdate": [
//               {
//                 "id":"gid://shopify/DeliveryLocationGroup/117527445824",
//                 "zonesToUpdate": [
//                   {
//                     "id": "gid://shopify/DeliveryZone/513788739904",
//                     "name": "Domestic",
//                     "countries": {
//                       "code": "BD"
//                     },
//                     "methodDefinitionsToCreate": [
//                       {
//                         "active": true,
//                         "name": "Standard",
//                         "priceConditionsToCreate": [
//                           {
//                             "criteria": {
//                               "amount": "500",
//                               "currencyCode": "BDT"
//                             },
//                             "operator": "GREATER_THAN_OR_EQUAL_TO"
//                           }
//                         ],
//                         "rateDefinition": {
//                           "price": {
//                             "amount": "100",
//                             "currencyCode": "BDT"
//                           }
//                         }
//                       }
//                     ]
//                   }
//                 ]
//               }
//             ]
//           }
//         },
//       },
//     );
    
//     const data = await response.json();
    
//     console.log(data);

// }



export default function AdditionalPage() {
  const { data, carrierList } = useLoaderData();
  const submit = useSubmit();
  const [showModal, setShowModal] = useState(false);
  const [fromState, setFromState] = useState({});
  const [selectedZoneID, setSelectedZoneID] = useState();
  
  const handleChange = () => {
    setFromState({})
    setShowModal(!showModal);
  };

  const setZoneID = (zoneID) => {
    handleChange();
    setSelectedZoneID(zoneID);
  }
  console.log(carrierList);
      
  return (
    <Page>
      <ui-title-bar title="Advanced Shipping Rate" />
      <BlockStack gap="400">
      {data && data.data.map((zone, index) => (
          <Card roundedAbove="sm" key={index} space-400>
            <BlockStack gap="200">
              <Text as="h1" variant="headingSm">
                {zone.name}
              </Text>
            </BlockStack>
            <Bleed marginBlockEnd="400" marginInline="400">
              <Box background="bg-surface-secondary" padding="400">
                <Button onClick={() => setZoneID(zone.id)} icon={PlusIcon}>Add Rate</Button>
              </Box>
            </Bleed>
          </Card>
        ))}
      </BlockStack>
      <Frame>
        <Modal
          open={showModal}
          onClose={handleChange}
          title="Add Rate" 
        >
          <Modal.Section>
            <Form method="POST">
              <BlockStack gap="400">
                <input type="text" name="zone" defaultValue={selectedZoneID} hidden/>
                <TextField label="Title" name="title" value={fromState?.title} onChange={(value) => setFromState({ ...fromState, title: value})} />
                <TextField label="Sub Title" name="subTitle" value={fromState?.subTitle} onChange={(value) => setFromState({ ...fromState, subTitle: value })} />

                <ButtonGroup >
                  <Button onClick={handleChange}>Cancel</Button>
                  <Button submit={true} variant="primary">Save</Button>
                </ButtonGroup>
              </BlockStack>
            </Form>
          </Modal.Section>
        </Modal>
      </Frame>
    </Page>
  );
}
  