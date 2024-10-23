import jsPsychSurveyMultiChoice from '@jspsych/plugin-survey-multi-choice'
import jsPsychImageKeyboardResponse from '@jspsych/plugin-image-keyboard-response'
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response'
import jsPsychPreload from '@jspsych/plugin-preload'
import { initJsPsych } from 'jspsych'

import { debugging, getUserInfo, mockStore, prolificCC, prolificCUrl } from './globalVariables'
import { saveTrialDataComplete, saveTrialDataPartial } from './lib/databaseUtils'
import { getMockDbState } from './lib/mockDatabase' // Mock Database Panel

import type { jsPsychSurveyMultiChoice, Task, TrialData } from './project'
import type { DataCollection } from 'jspsych'

import imgStim1 from './images/allburgers_majorityburgers.png'
import imgStim2 from './images/allburgers_minorityburgers.png'
import imgStim3 from './images/adhoc.png'
import imgStim4 from './images/darkbrown_blackhair.png'
import imgStim5 from './images/warm_hot.png'

/* Alternatively
 * type JsPsychInstance = ReturnType<typeof initJsPsych>
 * type JsPsychGetData = JsPsychInstance['data']['get']
 * export type JsPsychDataCollection = ReturnType<JsPsychGetData>
 */

const debug = debugging()
const mock = mockStore()

/* Mock Database Panel */

const debugButton = document.getElementById('debug-panel-button')
const debugPanel = document.getElementById('debug-panel-display')
const debugPanelPre = document.getElementById('debug-panel-code')

function updateDebugPanel() {
  if (debugPanelPre) {
    debugPanelPre.textContent = JSON.stringify(getMockDbState(), null, 2)
  }
}

function toggleDebugPanel() {
  debugPanel?.classList.toggle('hidden')
  updateDebugPanel()
}

debugButton?.addEventListener('click', () => {
  debugButton.blur()
  toggleDebugPanel()
})

const debuggingText = debug ? `<br /><br />redirect link : ${prolificCUrl}` : '<br />'
const exitMessage = `<p class="align-middle text-center"> 
Please wait. You will be redirected back to Prolific in a few moments. 
<br /><br />
If not, please use the following completion code to ensure compensation for this study: ${prolificCC}
${debuggingText}
</p>`

const exitExperiment = () => {
  document.body.innerHTML = exitMessage
  setTimeout(() => {
    window.location.replace(prolificCUrl)
  }, 3000)
}

const exitExperimentDebugging = () => {
  const contentDiv = document.getElementById('jspsych-content')
  if (contentDiv) contentDiv.innerHTML = exitMessage
}

export async function runExperiment() {
  if (debug) {
    console.log('--runExperiment--')
    console.log('UserInfo ::', getUserInfo())
  }

  /* initialize jsPsych */
  const jsPsych = initJsPsych({
    on_data_update: function (trialData: TrialData) {
      if (debug) {
        console.log('jsPsych-update :: trialData ::', trialData)
      }
      // if trialData contains a saveToFirestore property, and the property is true, then save the trialData to Firestore
      if (trialData.saveToFirestore) {
        saveTrialDataPartial(trialData).then(
          () => {
            if (debug) {
              console.log('saveTrialDataPartial: Success') // Success!
              if (mock) {
                updateDebugPanel()
              }
            }
          },
          (err: unknown) => {
            console.error(err) // Error!
          },
        )
      }
    },
    on_finish: (data: DataCollection) => {
      const contentDiv = document.getElementById('jspsych-content')
      if (contentDiv) contentDiv.innerHTML = '<p> Please wait, your data are being saved.</p>'
      saveTrialDataComplete(data.values()).then(
        () => {
          if (debug) {
            exitExperimentDebugging()
            console.log('saveTrialDataComplete: Success') // Success!
            console.log('jsPsych-finish :: data ::')
            console.log(data)
            setTimeout(() => {
              jsPsych.data.displayData()
            }, 3000)
          } else {
            exitExperiment()
          }
        },
        (err: unknown) => {
          console.error(err) // Error!
          exitExperiment()
        },
      )
    },
  })

  /* create timeline */
  var timeline = [];

  /* preload images */
  var preload = {
  type: jsPsychPreload,
  images: [imgStim1, imgStim2, imgStim3, imgStim4, imgStim5]
}
  timeline.push(preload)


  /* define welcome message trial */
  const welcome = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<span class="text-xl">Welcome to the experiment. Press any key to begin.</span>',
  }
  timeline.push(welcome)

  /* define instructions for first trial */
  const instructions1 = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
        <p>You're  a contestant on a game show where contestants choose from a set of items. Some of the items are associated with prizes, while others are not. You do not know which items are associated with prize and which are not. The game show host does know, but they cannot explicitly tell you this information. However, at various points in the game, the host can give you hints. Press any key to begin.</p>
      `,
    post_trial_gap: 2000,
  }
  timeline.push(instructions1)

  /* define trials */
  var trial1 = {
  type: jsPsychSurveyMultiChoice,
  questions: [
    {
      prompt: "Your task is to choose a numbered box. There are 100 numbered boxes in total and 5 of them contain a million dollar prize. The host tells the first contestant that there is money in <b>box 20 or box 25</b>. This contestant <b>picks box 20</b> and <b>finds a million dollars there</b>. Imagine you are the next contestant in this game. The host does not give you any hints. Which action are you most likely to take?", 
      name: 'ExFindsMil', 
      options: ['Choose box 25', 'Choose another box'], 
      required: true
    }, 
  ],
};
  timeline.push(trial1)

  var trial2 = {
  type: jsPsychSurveyMultiChoice,
  questions: [
    {
      prompt: "Your task is to choose a numbered box. There are 100 numbered boxes in total and 5 of them contain a million dollar prize. The host tells the first contestant that there is money in <b>box 20 or box 25</b>. This contestant <b>picks box 20</b> and <b>discovers it's empty</b>. Imagine you are the next contestant in this game. The host does not give you any hints. Which action are you most likely to take?", 
      name: 'ExFindsNothing', 
      options: ['Choose box 25', 'Choose another box'], 
      required: true
    }, 
  ],
};
  timeline.push(trial2)

  var trial3 = {
  type: jsPsychSurveyMultiChoice,
  questions: [
    {
      prompt: "Your task is to choose a numbered box. There are 100 numbered boxes in total and 5 of them contain a million dollar prize. The host tells the first contestant that there is money in <b>box 20 or box 25 or both</b>. This contestant <b>picks box 20</b> and <b>discovers it's empty</b>. Imagine you are the next contestant in this game. The host does not give you any hints. Which action are you most likely to take?", 
      name: 'InFindsNothing', 
      options: ['Choose box 25', 'Choose another box'], 
      required: true
    }, 
  ],
};
  timeline.push(trial3)

  var trial4 = {
  type: jsPsychSurveyMultiChoice,
  questions: [
    {
      prompt: "Your task is to choose a numbered box. There are 100 numbered boxes in total and 5 of them contain a million dollar prize. The host tells the first contestant that there is money in <b>box 20 or box 25 or both</b>. This contestant <b>picks box 20</b> and <b>finds a million dollars there</b>. Imagine you are the next contestant in this game. The host does not give you any hints. Which action are you most likely to take?", 
      name: 'InFindsMil', 
      options: ['Choose box 25', 'Choose another box'], 
      required: true
    }, 
  ],
};
  timeline.push(trial4)

  /* define instructions for second trial */
 var instructions2 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <p>In this experiment, you will be presented with two images. Your goal is to select the winning image. The host cannot tell you which image is the winning image, but he can give you hints.</p><p>If the winning image is on the left,  
    press the letter F on the keyboard as fast as you can. If the winning image is on the right, press the letter J 
    as fast as you can.</p>
    <div style='width: 700px;'>
    <div style='float: left;'><img src='${imgStim3}'></img>
    </div>
    <div style='float: right;'><img src='${imgStim4}'></img>
   </div>
    </div>
    <p>Press any key to begin.</p>
  `,
  post_trial_gap: 2000
};
timeline.push(instructions2)

  /* define trial stimuli array for timeline variables */
  var most_trial1 = {
  type: jsPsychImageKeyboardResponse,
  stimulus: imgStim1,
  choices: ['f', 'j'],
  prompt: "<p>Host hint: <b>Most of the items are burgers</b>.</p>",
  }
  timeline.push(most_trial1)

  var most_trial2 = {
  type: jsPsychImageKeyboardResponse,
  stimulus: imgStim1,
  choices: ['f', 'j'],
  prompt: "<p>Host hint: <b>Most but not all of the items are burgers</b>.</p>",
  }
  timeline.push(most_trial2)

  var some_trial1 = {
  type: jsPsychImageKeyboardResponse,
  stimulus: imgStim2,
  choices: ['f', 'j'],
  prompt: "<p>Host hint: <b>Some of the items are burgers</b>.</p>",
  }
  timeline.push(some_trial1)

  var some_trial2 = {
  type: jsPsychImageKeyboardResponse,
  stimulus: imgStim2,
  choices: ['f', 'j'],
  prompt: "<p>Host hint: <b>Some but not all of the items are burgers</b>.</p>",
  }
  timeline.push(some_trial2)

  var adhoc_trial1 = {
  type: jsPsychImageKeyboardResponse,
  stimulus: imgStim3,
  choices: ['f', 'j'],
  prompt: "<p>Host hint: <b>The top item is a burger</b>.</p>",
  }
  timeline.push(adhoc_trial1)

  var hair_trial1 = {
  type: jsPsychImageKeyboardResponse,
  stimulus: imgStim4,
  choices: ['f', 'j'],
  prompt: "<p>Host hint: <b>The figure on the card has dark hair</b>.</p>",
  }
  timeline.push(hair_trial1)

  var hair_trial2 = {
  type: jsPsychImageKeyboardResponse,
  stimulus: imgStim4,
  choices: ['f', 'j'],
  prompt: "<p>Host hint: <b>The figure on the card has dark hair, but not black hair</b>.</p>",
  }
  timeline.push(hair_trial2)

  var heat_trial1 = {
  type: jsPsychImageKeyboardResponse,
  stimulus: imgStim5,
  choices: ['f', 'j'],
  prompt: "<p>Host hint: <b>The item on the card is warm</b>.</p>",
  }
  timeline.push(hair_trial1)

  var heat_trial2 = {
  type: jsPsychImageKeyboardResponse,
  stimulus: imgStim5,
  choices: ['f', 'j'],
  prompt: "<p>Host hint: <b>The item on the card is warm but not hot</b>.</p>",
  }
  timeline.push(hair_trial2)


  /* Mock Database Panel */
  if (debug && mock) {
    if (debugButton) {
      debugButton.hidden = false
      debugButton.classList.remove('jspsych-display-element', 'hidden')
    }
    if (debugPanel) {
      debugPanel.hidden = false
      debugPanel.classList.remove('jspsych-display-element')
    }
  } else {
    debugButton?.remove()
    debugPanel?.remove()
  }

  /* start the experiment */
  // @ts-expect-error allow timeline to be type jsPsych TimelineArray
  await jsPsych.run(timeline)
}
