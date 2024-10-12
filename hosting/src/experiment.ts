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

  /* define welcome message trial */
  const welcome = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<span class="text-xl">Welcome to the experiment. Press any key to begin.</span>',
  }
  timeline.push(welcome)

  /* define instructions trial */
  const instructions = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
        <p>You're  a contestant on a game show where contestants choose from a set of items. Some of the items are associated with prizes, while other are not.</p> 
        <p> You do not know which items are associated with prize and which are not.</p> 
        <p>The game show host does know, but they cannot explicitly tell you this information. However, at various points in the game, the host can give you hints</p>
        <p>Press any key to begin.</p>
      `,
    post_trial_gap: 2000,
  }
  timeline.push(instructions)

  /* define trials */
  var trial = {
  type: jsPsychSurveyMultiChoice,
  questions: [
    {
      prompt: "Your task is to choose a numbered box. There are 100 numbered boxes in total and 5 of them contain a million dollar prize. The host tells the first contestant that there is money in box 20 or box 25. This contestant picks box 20 and finds a million dollars there. Imagine you are the next contestant in this game. The host does not give you any hints. Which action are you most likely to take?", 
      name: 'ExFindsMil', 
      options: ['Choose box 25', 'Choose another box'], 
      required: true
    }, 
    {
      prompt: "Your task is to choose a numbered box. There are 100 numbered boxes in total and 5 of them contain a million dollar prize. The host tells the first contestant that there is money in box 20 or box 25. This contestant picks box 20 discovers that the box is empty. Imagine you are the next contestant in this game. The host does not give you any hints. Which action are you most likely to take?", 
      name: 'ExFindsNothing', 
      options: ['Choose box 25', 'Choose another box'], 
      required: false
    }
  ],
};
  timeline.push(trial)
  
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
