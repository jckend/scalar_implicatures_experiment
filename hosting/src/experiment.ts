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

import imgBurg1 from './images/all_some_burger1.png'
import imgBurg2 from './images/all_some_burger2.png'
import imgStim3 from './images/adhoc.png'
import imgDark1 from './images/dark_black1.png'
import imgDark2 from './images/dark_black2.png'
import imgStim5 from './images/warm_hot.png'
import imgSnail1 from './images/all_some_snail1.png' 
import imgSnail2 from './images/all_some_snail2.png' 
import imgSpoon1 from './images/all_some_spoon1.png' 
import imgSpoon2 from './images/all_some_spoon2.png' 
import imgSax1 from './images/all_some_clamp1.png' 
import imgSax2 from './images/all_some_clamp2.png' 
import imgCouples1 from './images/couples_adhoc1.png' 
import imgCouples2 from './images/couples_adhoc2.png' 

/* Alternatively
 * type JsPsychInstance = ReturnType<typeof initJsPsych>
 * type JsPsychGetData = JsPsychInstance['data']['get']
 * export type JsPsychDataCollection = ReturnType<JsPsychGetData>
 */

const debug = debugging()
const mock = mockStore()

type Task = 'response' | 'fixation'
type Response = 'left' | 'right'
type KeyboardResponse = 'f' | 'j'

interface TrialData {
  task: Task
  response: Response
  saveIncrementally: Response
}

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
  images: [imgBurg1, imgBurg2, imgStim3, imgDark1, imgDark2, imgStim5, imgSnail1, imgSnail2, imgSpoon1, imgSpoon2, imgSax1, imgSax2, imgCouples1, imgCouples2]
}
  timeline.push(preload)


  /* define welcome message trial */
  const welcome = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<span class="text-xl">Welcome to the experiment. Press any key to begin.</span>',
  }
  timeline.push(welcome)

    /* define trial stimuli array for timeline variables */
  var few_trial1 = {
  type: jsPsychImageKeyboardResponse,
  stimulus: imgBurg1,
  stimulus_width: 700, 
  choices: ['f', 'j'],
  prompt: "<p>Host hint: <b>Few of the items are spoons</b>.</p>",
  }

  var few_trial2 = {
  type: jsPsychImageKeyboardResponse,
  stimulus: imgSax1,
  stimulus_width: 700, 
  choices: ['f', 'j'],
  prompt: "<p>Host hint: <b>Few of the items are clamps</b>.</p>",
  }

  var few_trial3 = {
  type: jsPsychImageKeyboardResponse,
  stimulus: imgSax2,
  stimulus_width: 700, 
  choices: ['f', 'j'],
  prompt: "<p>Host hint: <b>Few of the items are clamps</b>.</p>",
  }

  var few_trial4 = {
  type: jsPsychImageKeyboardResponse,
  stimulus: imgSnail2,
  stimulus_width: 700, 
  choices: ['f', 'j'],
  prompt: "<p>Host hint: <b>Few of the items on the card are snails</b>.</p>",
  }

  var heat_trial1 = {
  type: jsPsychImageKeyboardResponse,
  stimulus: imgStim5,
  stimulus_width: 700, 
  choices: ['f', 'j'],
  prompt: "<p>Host hint: <b>The item on the card is warm</b>.</p>",
  }

  var some_trial1 = {
  type: jsPsychImageKeyboardResponse,
  stimulus: imgSnail1,
  stimulus_width: 700, 
  choices: ['f', 'j'],
  prompt: "<p>Host hint: <b>Some of the items are spoons</b>.</p>",
  }

  var some_trial2 = {
  type: jsPsychImageKeyboardResponse,
  stimulus: imgSax1,
  stimulus_width: 700, 
  choices: ['f', 'j'],
  prompt: "<p>Host hint: <b>Some of the items are saxophones</b>.</p>",
  }

  var some_trial3 = {
  type: jsPsychImageKeyboardResponse,
  stimulus: imgBurg1,
  stimulus_width: 700, 
  choices: ['f', 'j'],
  prompt: "<p>Host hint: <b>Some of the items are burgers</b>.</p>",
  }

  var some_trial4 = {
  type: jsPsychImageKeyboardResponse,
  stimulus: imgSnail2,
  stimulus_width: 700, 
  choices: ['f', 'j'],
  prompt: "<p>Host hint: <b>Some of the items are spoons</b>.</p>",
  }

  var some_trial5 = {
  type: jsPsychImageKeyboardResponse,
  stimulus: imgSax2,
  stimulus_width: 700, 
  choices: ['f', 'j'],
  prompt: "<p>Host hint: <b>Some of the items are saxophones</b>.</p>",
  }

  var some_trial6 = {
  type: jsPsychImageKeyboardResponse,
  stimulus: imgBurg2,
  stimulus_width: 700, 
  choices: ['f', 'j'],
  prompt: "<p>Host hint: <b>Some of the items are burgers</b>.</p>",
  }

  var adhoc_trial1 = {
  type: jsPsychImageKeyboardResponse,
  stimulus: imgCouples2,
  stimulus_width: 700, 
  choices: ['f', 'j'],
  prompt: "<p>Host hint: <b>The man on the left is wearing a teal shirt</b>.</p>",
  }

  var adhoc_trial2 = {
  type: jsPsychImageKeyboardResponse,
  stimulus: imgCouples1,
  stimulus_width: 700, 
  choices: ['f', 'j'],
  prompt: "<p>Host hint: <b>The man on the left is wearing a teal shirt</b>.</p>",
  }

  var most_trial1 = {
  type: jsPsychImageKeyboardResponse,
  stimulus: imgBurg2,
  stimulus_width: 700, 
  choices: ['f', 'j'],
  prompt: "<p>Host hint: <b>Most of the items are burgers</b>.</p>",
  }

  var most_trial2 = {
  type: jsPsychImageKeyboardResponse,
  stimulus: imgBurg1,
  stimulus_width: 700, 
  choices: ['f', 'j'],
  prompt: "<p>Host hint: <b>Most of the items are burgers</b>.</p>",
  }

  var most_trial3 = {
  type: jsPsychImageKeyboardResponse,
  stimulus: imgSnail1,
  stimulus_width: 700, 
  choices: ['f', 'j'],
  prompt: "<p>Host hint: <b>Most of the items are spoons</b>.</p>",
  }

  var most_trial4 = {
  type: jsPsychImageKeyboardResponse,
  stimulus: imgSax1,
  stimulus_width: 700, 
  choices: ['f', 'j'],
  prompt: "<p>Host hint: <b>Most of the items are saxophones</b>.</p>",
  }

  var hair_trial1 = {
  type: jsPsychImageKeyboardResponse,
  stimulus: imgDark2,
  stimulus_width: 700, 
  choices: ['f', 'j'],
  prompt: "<p>Host hint: <b>The figure on the card has dark hair</b>.</p>",
  }

  const trials = [few_trial1, few_trial2, few_trial3, few_trial4, some_trial1, some_trial2, some_trial3, some_trial4, some_trial5, some_trial6, most_trial1, most_trial2, most_trial3, hair_trial1, adhoc_trial1, adhoc_trial2]
    
  /* define instructions for semi-cooperative trial */
 var instructions2 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <p>You are a contestant on a game show. You will be presented with two images. Your goal is to select the winning image.</p>
    <p>The host cannot tell you which image is the winning image, but she can provide hints. These hints will never be false, but they may be misleading.</p>
    <p>If the winning image is on the left,  
    press the letter F on the keyboard as fast as you can. If the winning image is on the right, press the letter J 
    as fast as you can.</p>
    <center>
    <div style='width: 700px;'><img src='${imgSnail1}'></img>
    </div>
    </center>
    <p>Press any key to begin.</p>
  `,
  post_trial_gap: 2000
};
timeline.push(instructions2)

  /* define fixation and test trials */
  const fixation = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<div style="font-size:60px;">+</div>',
    choices: 'NO_KEYS',
    trial_duration: function () {
      return jsPsych.randomization.sampleWithoutReplacement(
        [250, 500, 750, 1000, 1250, 1500, 1750, 2000],
        1,
      )[0] as number
    },
    data: {
      task: 'fixation' satisfies Task,
    },
  }

  const test = {
    type: jsPsychImageKeyboardResponse,
    stimulus: jsPsych.timelineVariable('stimulus') as unknown as string,
    prompt: jsPsych.timelineVariable('prompt') as unknown as string,
    choices: ['f', 'j'] satisfies KeyboardResponse[],
    data: {
      task: 'response' satisfies Task
    },
    on_finish: function (data: TrialData) {
      data.correct = jsPsych.pluginAPI.compareKeys(data.response || null, data.correct_response || null)
      data.saveIncrementally = true
    },
  }

  /* define test procedure */
  const test_procedure = {
    timeline: [fixation, test],
    timeline_variables: trials,
    repetitions: 3,
    randomize_order: true,
  }
  timeline.push(test_procedure)

  
  /* define instructions for semi-cooperative trial */
 var instructions2 = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <p>You are a contestant on a game show. You will be presented with two images. Your goal is to select the winning image.</p>
    <p>Your opponent knows which card is the winning card. Your opponent wins if you select the wrong card.</p> 
    <p>She must provide you with a description of the winning card. This description cannot be false, but it may be misleading.</p>
    <p>If the winning image is on the left,  
    press the letter F on the keyboard as fast as you can. If the winning image is on the right, press the letter J 
    as fast as you can.</p>
    <center>
    <div style='width: 700px;'><img src='${imgSax1}'></img>
    </div>
    </center>
    <p>Press any key to begin.</p>
  `,
  post_trial_gap: 2000
};
timeline.push(instructions2)

  /* define test procedure */
  const test_procedure2 = {
    timeline: [fixation, test],
    timeline_variables: trials,
    repetitions: 3,
    randomize_order: true,
  }
  timeline.push(test_procedure2)


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
