import { Form } from '@remix-run/react';
import { BlockStack, Button, ButtonGroup, Frame, TextField } from '@shopify/polaris';
import React from 'react';

const Modal = ({showModal, handleChange, selectedZoneID, fromState, setFromState}) => {
  return (
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
                  <Button submit={true} variant="primary">Save</Button>
                </ButtonGroup>
              </BlockStack>
            </Form>
          </Modal.Section>
        </Modal>
      </Frame>
  );
};

export default Modal;