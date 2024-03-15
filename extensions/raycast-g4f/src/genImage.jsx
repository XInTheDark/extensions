import useGPT, { g4f_providers } from "./api/gpt";
import * as G4F from "g4f";
const g4f = new G4F.G4F();
import fs from "fs";
import React, { useState, useEffect } from "react";
import {
  getPreferenceValues,
  showToast,
  Toast,
  Action,
  Image,
  Grid,
  useNavigation,
  ActionPanel,
  Form,
  Clipboard,
} from "@raycast/api";

export default function GenImage(props) {
  let { query: argQuery } = props.arguments;
  if (!argQuery) argQuery = props.fallbackText ?? "";

  let imagePath = "";

  (async () => {
    await showToast({
      style: Toast.Style.Animated,
      title: "Waiting for GPT...",
    });

    // load provider and model from preferences
    const preferences = getPreferenceValues();
    const providerString = preferences["imageProvider"];
    const [provider, providerOptions] = image_providers[providerString];
    const options = {
      provider: provider,
      providerOptions: providerOptions,
    };

    const base64Image = await g4f.imageGeneration(argQuery, options);

    // save image
    const filePath = "/tmp/raycast-g4f/g4f-image_" + new Date().toISOString().replace(/:/g, "-").split(".")[0] + ".png";

    fs.writeFile(filePath, base64Image, "base64", (err) => {
      if (err) {
        showToast({
          style: Toast.Style.Failure,
          title: "Error saving image",
        });
        console.log("Current path: " + __dirname);
        console.error(err);
      } else {
        imagePath = "file://" + filePath;
      }
    });

    console.log("Image saved to: " + filePath);

    await showToast({
      style: Toast.Style.Success,
      title: "Image generated",
    });
  })();

  console.log("checkpoint");
  // if (!imagePath) return null; // TODO: make this an empty grid view

  return (
    <Grid>
      <Grid.Item
        content={{ source: imagePath }}
        actions={
          <ActionPanel>
            <Action title="Copy Image" onAction={async () => await Clipboard.copy(imagePath)}></Action>
          </ActionPanel>
        }
      />
    </Grid>
  );
}

export const image_providers = {
  Prodia: [
    g4f.providers.Prodia,
    {
      // list of available models: https://rentry.co/b6i53fnm
      model: "ICantBelieveItsNotPhotography_seco.safetensors [4e7a3dfd]",
      samplingSteps: 15,
      cfgScale: 25,
    },
  ],
  ProdiaStableDiffusionXL: [
    g4f.providers.ProdiaStableDiffusionXL,
    {
      // list of available models: https://rentry.co/wfhsk8sv
      model: "sd_xl_base_1.0.safetensors [be9edd61]",
      height: 1024,
      width: 1024,
      samplingSteps: 25,
      cfgScale: 18,
    },
  ],
};
