/* global LanguageModel */
const buttonPrompt = document.body.querySelector('#button-prompt');
const buttonReset = document.body.querySelector('#button-reset');
const elementResponse = document.body.querySelector('#response');
const elementLoading = document.body.querySelector('#loading');
const elementError = document.body.querySelector('#error');
const buttonDownload = document.body.querySelector('#button-download');
const inputImage = document.body.querySelector("#equation")

let session;

async function runPrompt(prompt, params) {
    const session = await LanguageModel.create({
      expectedInputs: [{ type: "image" }],
    });
    const prompt2 =
      "Output the raw latex equivalent";

    const stream = session.promptStreaming([
      {
        role: "user",
        content: [
          { type: "text", value: prompt2 },
          { type: "image", value: inputImage.files[0] },
        ],
      },
    ]);
    let chunks = ""
    for await (const chunk of stream) { 
      chunks += chunk;
    }
    return chunks
}



async function reset() {
  if (session) {
    session.destroy();
  }
  session = null;
}

async function initDefaults() {
  const defaults = await LanguageModel.params();
  console.log('Model default:', defaults);
  if (!('LanguageModel' in self)) {
    showResponse('Model not available');
    return;
  }
  // sliderTemperature.value = defaults.defaultTemperature;
  // // Pending https://issues.chromium.org/issues/367771112.
  // // sliderTemperature.max = defaults.maxTemperature;
  // if (defaults.defaultTopK > 3) {
  //   // limit default topK to 3
  //   sliderTopK.value = 3;
  //   labelTopK.textContent = 3;
  // } else {
  //   sliderTopK.value = defaults.defaultTopK;
  //   labelTopK.textContent = defaults.defaultTopK;
  // }
  // sliderTopK.max = defaults.maxTopK;
  // labelTemperature.textContent = defaults.defaultTemperature;
}

initDefaults();

buttonReset.addEventListener('click', () => {
  hide(elementLoading);
  hide(elementError);
  hide(elementResponse);
  reset();
  buttonReset.setAttribute('disabled', '');
});



buttonDownload.addEventListener('click', async (event) => {
    await LanguageModel.availability();
    const session = await LanguageModel.create({
    monitor(m) {
      m.addEventListener('downloadprogress', (e) => {
        console.log(`Downloaded ${e.loaded * 100}%`);
      });
    },
  });
});

buttonPrompt.addEventListener('click', async () => {
  // const prompt = inputPrompt.value.trim();
  showLoading();
  const response =await runPrompt("", "")
  showResponse(response)
});

function showLoading() {
  buttonReset.removeAttribute('disabled');
  hide(elementResponse);
  hide(elementError);
  show(elementLoading);
}

function showResponse(response) {
  hide(elementLoading);
  show(elementResponse);

  response = response.replace("```latex", "")
  response = response.replace("```", "")

  elementResponse.innerHTML = response
}

function showError(error) {
  show(elementError);
  hide(elementResponse);
  hide(elementLoading);
  elementError.textContent = error;
}

function show(element) {
  element.removeAttribute('hidden');
}

function hide(element) {
  element.setAttribute('hidden', '');
}
