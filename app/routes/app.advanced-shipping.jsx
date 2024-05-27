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
    Icon,
    Badge,
} from "@shopify/polaris";
import {PlusIcon, EditIcon, DeleteIcon} from '@shopify/polaris-icons';
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

  let rateProviderId = carrierList.data.filter(list => list.name == "Shipping Rate Provider")[0].id;
      
  const shippingRateData = await fetch(process.env.APP_URL + `/api/shippingRate?shop=${process.env.SHOP_NAME}&rateProviderId=${rateProviderId}`)
                                  .then(response => response.json())
                                  .then(result => {
                                    return result.data;
                                  })
                                  .catch(error => console.log('error', error));
  
    return json({ data: shippingZone, shippingRateData: shippingRateData});
};

export const action = async ({ request }) => { 
    // Get the form data from the request
  let settings = await request.formData();
  settings = Object.fromEntries(settings);
  const { admin, session } = await authenticate.admin(request);

  const carrierList = await admin.rest.resources.CarrierService.all({
      session: session,
  });

  let rateProviderId = carrierList.data.filter(list => list.name == "Shipping Rate Provider")[0].id;

  // Use the `get` method to get the value of the form field
  var formdata = new FormData();
  const _action = settings?._action;

  switch (_action) {
    case "CREATE":
      formdata.append("zoneID", settings?.zoneId);
      formdata.append("rateProviderId", rateProviderId);
      formdata.append("rateTitle", settings?.title);
      formdata.append("rateSubtitle", settings?.subTitle);
      formdata.append("active", false);
      formdata.append("shop", process.env.SHOP_NAME);
      formdata.append("_action", settings?._action);

      break;
    case "DELETE":
      formdata.append("deletedId", settings?.rateProviderId);
      formdata.append("shop", process.env.SHOP_NAME);
      formdata.append("_action", settings?._action);
      
      break;
    default:
      // Optional: handle other methods or return a method not allowed response
      return new Response("Method Not Allowed", { status: 405 });
  }
  
  var requestOptions = {
    method: 'POST',
    body: formdata,
    redirect: 'follow'
  };

  // You can use newUser to create a new user in your database
  fetch(process.env.APP_URL + "/api/shippingRate", requestOptions)
        .then(response => response.json())
        .then(result => {
            console.log(result);
        })
        .catch(error => console.log('error', error));

  // Redirect to the user page
  return json(formdata);
}

export default function AdditionalPage() {
  const { data, shippingRateData } = useLoaderData();
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
        
  return (
    <Page>
      <ui-title-bar title="Advanced Shipping Rate" />
      <BlockStack gap="400">
        {data && data.data.map((zone, index) => (
          <div key={index}>
            <BlockStack gap="200">
              <Text as="h1" variant="headingXl" padding="400">
                {zone.name}
              </Text>
            </BlockStack>
            <Card roundedAbove="sm">
              {shippingRateData && shippingRateData.map((rate, index) =>
                zone.id == rate.zoneId && 
                  <Box gap="200" key={index}>
                    <Text as="h1" variant="headingLg">
                      {rate.rateTitle}
                      <Badge padding="200" tone={rate.active ? "success" : ""}>{rate.active ? "Connected" : "Not Connected"}</Badge>
                    </Text>
                    {/* <Button icon={EditIcon}>Edit Rate</Button> */}
                    <Link url={`/app/advanced-shipping/${rate.id}`} icon={EditIcon}>Edit Rate</Link>
                    <Form method="POST">
                      <input type="text" name="_action" defaultValue="DELETE" hidden/>
                      <input type="number" name="rateProviderId" defaultValue={rate.id} hidden/>
                      <Button tone="critical" submit={true} icon={DeleteIcon}>Delete Rate</Button>
                    </Form>
                  </Box>
              )}
              <Bleed marginBlockEnd="400" marginInline="400">
                <Box background="bg-surface-secondary" padding="400">
                  <Button onClick={() => setZoneID(zone.id)} icon={PlusIcon}>Add Rate</Button>
                </Box>
              </Bleed>
            </Card>
          </div>
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
                <input type="text" name="zoneId" defaultValue={selectedZoneID} hidden/>
                <input type="text" name="_action" defaultValue="CREATE" hidden/>
                <input type="text" name="zone" defaultValue={selectedZoneID} hidden/>
                <TextField label="Title" name="title" value={fromState?.title} onChange={(value) => setFromState({ ...fromState, title: value})} />
                <TextField label="Sub Title" name="subTitle" value={fromState?.subTitle} onChange={(value) => setFromState({ ...fromState, subTitle: value })} />

                <ButtonGroup >
                  <Button onClick={handleChange}>Cancel</Button>
                  <Button onClick={handleChange} submit={true} variant="primary">Save</Button>
                </ButtonGroup>
              </BlockStack>
            </Form>
          </Modal.Section>
        </Modal>
      </Frame>
    </Page>
  );
}
  