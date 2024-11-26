// import jsPsychSurveyMultiChoice from '@jspsych/plugin-survey-multi-choice'
import externalHtml from '@jspsych/plugin-external-html'
import jsPsychHtmlButtonResponse from '@jspsych/plugin-html-button-response'
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response'
import jsPsychImageKeyboardResponse from '@jspsych/plugin-image-keyboard-response'
import jsPsychPreload from '@jspsych/plugin-preload'
import { initJsPsych } from 'jspsych'

import { debugging, getUserInfo, mockStore, prolificCC, prolificCUrl } from './globalVariables'
import { saveTrialDataComplete, saveTrialDataPartial } from './lib/databaseUtils'

// import type { jsPsychSurveyMultiChoice, Task, TrialData } from './project'
import type { SaveableDataRecord } from '../types/project'
import type { DataCollection } from 'jspsych'

import imgStim3 from './images/adhoc.png'
import imgBurg1 from './images/all_some_burger1.png'
import imgBurg2 from './images/all_some_burger2.png'
import imgSax1 from './images/all_some_clamp1.png'
import imgSax2 from './images/all_some_clamp2.png'
import imgSnail1 from './images/all_some_snail1.png'
import imgSnail2 from './images/all_some_snail2.png'
import imgSpoon1 from './images/all_some_spoon1.png'
import imgSpoon2 from './images/all_some_spoon2.png'
import imgCouples1 from './images/couples_adhoc1.png'
import imgCouples2 from './images/couples_adhoc2.png'
import imgDark1 from './images/dark_black1.png'
import imgDark2 from './images/dark_black2.png'
import imgPartic1 from './images/participated_won_1.png'
import imgPartic2 from './images/participated_won_2.png'
import imgWarm1 from './images/warmhot_1.png'
import imgWarm2 from './images/warmhot_2.png'

/* Alternatively
 * type JsPsychInstance = ReturnType<typeof initJsPsych>
 * type JsPsychGetData = JsPsychInstance['data']['get']
 * export type JsPsychDataCollection = ReturnType<JsPsychGetData>
 */

const debug = debugging()
const mock = mockStore()

type Task = 'response' | 'fixation' | 'question'
type Response = 'left' | 'right'
type KeyboardResponse = 'ArrowLeft' | 'ArrowRight'

interface TrialData {
  task: Task
  response: Response
  saveIncrementally: boolean
}

const debuggingText = debug ? `<br /><br />redirect link : ${prolificCUrl}` : '<br />'
const exitMessage = `<p class="align-middle text-center"> 
Please wait. You will be redirected back to Prolific in a few moments. 
<br /><br />
If not, please use the following completion code to ensure compensation for this study: ${prolificCC}
${debuggingText}
</p>`

const exitExperiment = (): void => {
  document.body.innerHTML = exitMessage
  setTimeout(() => {
    window.location.replace(prolificCUrl)
  }, 3000)
}

const exitExperimentDebugging = (): void => {
  const contentDiv = document.getElementById('jspsych-content')
  if (contentDiv) contentDiv.innerHTML = exitMessage
}

export async function runExperiment(updateDebugPanel: () => void) {
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
      // if trialData contains a saveIncrementally property, and the property is true, then save the trialData to Firestore immediately (otherwise the data will be saved at the end of the experiment)
      if (trialData.saveIncrementally) {
        saveTrialDataPartial(trialData as unknown as SaveableDataRecord).then(
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
  const timeline: Record<string, unknown>[] = []

  /* preload images */
  const preload = {
    type: jsPsychPreload,
    images: [
      imgBurg1,
      imgBurg2,
      imgStim3,
      imgDark1,
      imgDark2,
      imgWarm1,
      imgWarm2,
      imgSnail1,
      imgSnail2,
      imgSpoon1,
      imgSpoon2,
      imgSax1,
      imgSax2,
      imgCouples1,
      imgCouples2,
      imgPartic1,
      imgPartic2,
    ],
  }
  timeline.push(preload)

  /* define welcome message trial */
  const welcome = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<span class="text-xl">Welcome to the experiment. Press any key to begin.</span>',
  }
  timeline.push(welcome)

  /* define trial variables for training trials */
  var few_trial0 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgBurg1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>Few of the items are spoons</b>.</p>', 
  }

  var heat_trial0 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgWarm1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>The item on the card is warm</b>.</p>',
  }

  var some_trial0 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgSnail1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>Some of the items are spoons</b>.</p>',
  }

  var adhoc_trial0 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgCouples1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>The man on the card is wearing a teal shirt</b>.</p>',
  }

  var if_trial = {
    type: 'html-keyboard-response',
    stimulus: 'You entered an invalid response. If the likelier image is on the left, press the left arrow <kbd>&larr;</kbd> on the keyboard as fast as you can. If the likelier image is on the right, press the right arrow <kbd>&rarr;</kbd> as fast as you can.'
}

var if_node = {
    timeline: [if_trial],
    conditional_function: function(){
        // get the data from the previous trial,
        // and check which key was pressed
        var data = jsPsych.data.get().last(1).values()[0];
        if(jsPsych.pluginAPI.compareKeys(data.response, 'ArrowLeft' || 'ArrowRight')){
            return false;
        } else {
            return true;
        }
    }
}

  var most_trial0 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgBurg2,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>Most of the items are burgers</b>.</p>',
  }

  /* define trial variables for cooperative trials */
  var few_trial1 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgBurg1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p>Host hint: <b>Few of the items are spoons</b>.</p>',
  }

  var few_trial2 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgSax1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p>Host hint: <b>Few of the items are clamps</b>.</p>',
  }

  var few_trial3 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgSax2,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p>Host hint: <b>Few of the items are clamps</b>.</p>',
  }

  var few_trial4 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgSnail2,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p>Host hint: <b>Few of the items on the card are snails</b>.</p>',
  }

  var heat_trial1 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgWarm1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p>Host hint: <b>The item on the card is warm</b>.</p>',
  }

  var some_trial1 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgSnail1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p>Host hint: <b>Some of the items are spoons</b>.</p>',
  }

  var some_trial2 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgSax1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p>Host hint: <b>Some of the items are saxophones</b>.</p>',
  }

  var some_trial3 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgBurg1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p>Host hint: <b>Some of the items are burgers</b>.</p>',
  }

  var some_trial4 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgSnail2,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p>Host hint: <b>Some of the items are spoons</b>.</p>',
  }

  var some_trial5 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgSax2,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p>Host hint: <b>Some of the items are saxophones</b>.</p>',
  }

  var some_trial6 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgBurg2,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p>Host hint: <b>Some of the items are burgers</b>.</p>',
  }

  var adhoc_trial1 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgCouples2,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p>Host hint: <b>The man on the card is wearing a teal shirt</b>.</p>',
  }

  var adhoc_trial2 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgCouples1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p>Host hint: <b>The man on the card is wearing a teal shirt</b>.</p>',
  }

  var most_trial1 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgBurg2,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p>Host hint: <b>Most of the items are burgers</b>.</p>',
  }

  var most_trial2 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgBurg1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p>Host hint: <b>Most of the items are burgers</b>.</p>',
  }

  var most_trial3 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgSnail1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p>Host hint: <b>Most of the items are spoons</b>.</p>',
  }

  var most_trial4 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgSax1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p>Host hint: <b>Most of the items are saxophones</b>.</p>',
  }

  var hair_trial1 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgDark2,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p>Host hint: <b>The figure on the card has dark hair</b>.</p>',
  }

  var partic_trial1 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgPartic2,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p>Host hint: <b>The medal on the card was won by someone who participated</b>.</p>',
  }

  var partic_trial2 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgPartic1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p>Host hint: <b>The medal on the card was won by someone who participated</b>.</p>',
  }

  var warm_trial1 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgWarm1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p>Host hint: <b>The item on the card is warm</b>.</p>',
  }

  var warm_trial2 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgWarm2,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p>Host hint: <b>The item on the card is warm</b>.</p>',
  }

  /* define trial variables for non-cooperative trials */
  var nfew_trial1 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgBurg1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p>Opponent description: <b>Few of the items are spoons</b>.</p>',
  }

  var nfew_trial2 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgSax1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p>Opponent description: <b>Few of the items are clamps</b>.</p>',
  }

  var nfew_trial3 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgSax2,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p>Opponent description: <b>Few of the items are clamps</b>.</p>',
  }

  var nfew_trial4 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgSnail2,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p>Opponent description: <b>Few of the items on the card are snails</b>.</p>',
  }

  var nheat_trial1 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgWarm1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p>Opponent description: <b>The item on the card is warm</b>.</p>',
  }

  var nsome_trial1 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgSnail1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p>Opponent description: <b>Some of the items are spoons</b>.</p>',
  }

  var nsome_trial2 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgSax1,
    stimulus_width: 700,
    choices: ['f', 'j'],
    prompt: '<p>Opponent description: <b>Some of the items are saxophones</b>.</p>',
  }

  var nsome_trial3 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgBurg1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p>Opponent description: <b>Some of the items are burgers</b>.</p>',
  }

  var nsome_trial4 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgSnail2,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p>Opponent description: <b>Some of the items are spoons</b>.</p>',
  }

  var nsome_trial5 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgSax2,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p>Opponent description: <b>Some of the items are saxophones</b>.</p>',
  }

  var nsome_trial6 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgBurg2,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p>Opponent description: <b>Some of the items are burgers</b>.</p>',
  }

  var nadhoc_trial1 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgCouples2,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p>Opponent description: <b>The man on the card is wearing a teal shirt</b>.</p>',
  }

  var nadhoc_trial2 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgCouples1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p>Opponent description: <b>The man on the card is wearing a teal shirt</b>.</p>',
  }

  var nmost_trial1 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgBurg2,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p>Opponent description: <b>Most of the items are burgers</b>.</p>',
  }

  var nmost_trial2 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgBurg1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p>Opponent description: <b>Most of the items are burgers</b>.</p>',
  }

  var nmost_trial3 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgSnail1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p>Opponent description: <b>Most of the items are spoons</b>.</p>',
  }

  var nmost_trial4 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgSax1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p>Opponent description: <b>Most of the items are saxophones</b>.</p>',
  }

  var nhair_trial1 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgDark2,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p>Opponent description: <b>The figure on the card has dark hair</b>.</p>',
  }

  var npartic_trial1 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgPartic2,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p>Opponent description: <b>The medal on the card was won by someone who participated</b>.</p>',
  }

  var npartic_trial2 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgPartic1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p>Opponent description: <b>The medal on the card was won by someone who participated</b>.</p>',
  }

  var nwarm_trial1 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgWarm1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p>Opponent description: <b>The item on the card is warm</b>.</p>',
  }

  var nwarm_trial2 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgWarm2,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p>Opponent description: <b>The item on the card is warm</b>.</p>',
  }

  const training = [few_trial0, some_trial0, adhoc_trial0, heat_trial0, most_trial0, if_node]
  const trials = [
    few_trial1,
    few_trial2,
    few_trial3,
    few_trial4,
    some_trial1,
    some_trial2,
    some_trial3,
    some_trial4,
    some_trial5,
    some_trial6,
    hair_trial1,
    adhoc_trial1,
    adhoc_trial2,
    partic_trial1,
    partic_trial2,
    warm_trial1,
    warm_trial2,
  ]
  const ntrials = [
    nfew_trial1,
    nfew_trial2,
    nfew_trial3,
    nfew_trial4,
    nsome_trial1,
    nsome_trial2,
    nsome_trial3,
    nsome_trial4,
    nsome_trial5,
    nsome_trial6,
    nhair_trial1,
    nadhoc_trial1,
    nadhoc_trial2,
    npartic_trial1,
    npartic_trial2,
    nwarm_trial1,
    nwarm_trial2,
  ]

  /* consent */
  const consent = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
    <div style="margin-left: 200px; margin-right: 200px; text-align: left;">
      <b><p style="margin-bottom: 20px;">Please consider this information carefully before deciding whether to participate in this research.</p></b>
      
      <p style="margin-bottom: 20px;">The purpose of this research is to examine which factors influence linguistic meaning. You will be asked to make judgements about the meaning of sentences in different scenarios. We are simply interested in your judgement. The study will take less than 1 hour to complete, and you will receive less than $20 on Prolific. Your compensation and time commitment are specified in the study description. There are no anticipated risks associated with participating in this study. The effects of participating should be comparable to those you would ordinarily experience from viewing a computer monitor and using a mouse or keyboard for a similar amount of time. At the end of the study, we will provide an explanation of the questions that motivate this line of research and will describe the potential implications.</p>
      
      <p style="margin-bottom: 20px;"margin-bottom: 50px;>Your participation in this study is completely voluntary and you may refuse to participate or you may choose to withdraw at any time without penalty or loss of benefits to you which are otherwise entitled. Your participation in this study will remain confidential. No personally identifiable information will be associated with your data. Also, all analyses of the data will be averaged across all the participants, so your individual responses will never be specifically analyzed.</p>
      
      <p style="margin-bottom: 20px;">If you have questions or concerns about your participation or payment, or want to request a summary of research findings, please contact Dr. Jonathan Phillips at <a href="mailto:Jonathan.S.Phillips@dartmouth.edu">Jonathan.S.Phillips@dartmouth.edu</a>.</p>
      
      <p style="margin-bottom: 20px;">Please save a copy of this form for your records.</p>
      
      <h3><b>Agreement:</b></h3>
      
      <p>The nature and purpose of this research have been sufficiently explained and I agree to participate in this study. I understand that I am free to withdraw at any time without incurring any penalty. Please consent by clicking the button below to continue. Otherwise, please exit the study at any time.</p>
    </div>
  `,
    choices: ['Submit'],
    //this specifies the way in which the data will be configured inside jspsych data variable...
    data: {
      internal_type: 'consent',
      trial_name: 'consent',
    },
  }
  timeline.push(consent)

  /* define fixation and test trials */
  const fixation = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<div style="font-size:60px;">+</div>',
    choices: 'NO_KEYS',
    trial_duration: function () {
      return jsPsych.randomization.sampleWithoutReplacement([250, 500, 750, 1000, 1250, 1500, 1750, 2000], 1)[0]
    },
    data: {
      task: 'fixation' satisfies Task,
    },
  }

  const question = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: jsPsych.timelineVariable('prompt'),
    choices: 'NO_KEYS',
    trial_duration: 2000,
    data: {
      task: 'question' satisfies Task,
    },
  }

  const test = {
    type: jsPsychImageKeyboardResponse,
    prompt: jsPsych.timelineVariable('prompt') as unknown as string,
    stimulus: jsPsych.timelineVariable('stimulus') as unknown as string,
    choices: ['ArrowLeft', 'ArrowRight'] satisfies KeyboardResponse[],
    data: {
      task: 'response' satisfies Task,
      // correct_response: jsPsych.timelineVariable('correct_response') as unknown as string,
    },
    on_finish: function (data: TrialData) {
      // data.correct = jsPsych.pluginAPI.compareKeys(data.response || null, data.correct_response || null)
      data.saveIncrementally = true
    },
  }

  /* define instructions for training trials*/
  var instructions0 = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
    <p>You will be presented with two images. Select the image you think is likelier to fit the description.</p>
    <p>If the likelier image is on the left, press the left arrow <kbd>&larr;</kbd> on the keyboard as fast as you can. If the likelier image is on the right, press the right arrow <kbd>&rarr;</kbd> as fast as you can.</p>
    <center>
    <div style='width: 700px;'><img src='${imgBurg2}'></img>
    </div>
    </center>
    <p>Press any key to begin.</p>
  `,
    post_trial_gap: 2000,
  }
  timeline.push(instructions0)

  /* define training procedure */
  const test_procedure0 = {
    timeline: [fixation, question, test, if_node],
    on_finish: function(){jsPsych.data.displayData(),
    timeline_variables: training,
    repetitions: 1,
    randomize_order: false,
  }
  timeline.push(test_procedure0)

  /* define instructions for semi-cooperative trial */
  var instructions1 = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
    <p style="background-color:Tomato;"><strong>Scenario:</strong> You are a contestant on a game show. You will be presented with two images. Your goal is to select the winning image. The host cannot tell you which image is the winning image, but she can provide hints. These hints will never be false, but they may be misleading.</p>
    <p>If the winning image is on the left, press the left arrow <kbd>&larr;</kbd> on the keyboard as fast as you can. If the winning image is on the right, press the right arrow <kbd>&rarr;</kbd> as fast as you can.</p>
    <center>
    <div style='width: 700px;'><img src='${imgSnail1}'></img>
    </div>
    </center>
    <p>Press any key to begin.</p>
  `,
    post_trial_gap: 2000,
  }
  timeline.push(instructions1)

  /* define test procedure */
  const test_procedure = {
    timeline: [fixation, question, test],
    timeline_variables: trials,
    repetitions: 1,
    randomize_order: true,
  }
  timeline.push(test_procedure)

  /* define instructions for semi-cooperative trial */
  var instructions2 = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
    <p style="background-color:Tomato;"><strong>Scenario:</strong> You are a contestant on a game show. You will be presented with two images. Your goal is to select the winning image, while your opponent's goal is to get you to select the losing image. Your opponent will provide you with a description of the winning image. These descriptions will never be false, but they may be misleading.</p>
    <p>If the winning image is on the left, press the left arrow <kbd>&larr;</kbd> on the keyboard as fast as you can. If the winning image is on the right, press the right arrow <kbd>&rarr;</kbd> as fast as you can.</p>
    <center>
    <div style='width: 700px;'><img src='${imgSnail1}'></img>
    </div>
    </center>
    <p>Press any key to begin.</p>
  `,
    post_trial_gap: 2000,
  }
  timeline.push(instructions2)

  /* define test procedure */
  const test_procedure2 = {
    timeline: [fixation, question, test],
    timeline_variables: ntrials,
    repetitions: 1,
    randomize_order: true,
  }
  timeline.push(test_procedure2)

  /* start the experiment */
  // @ts-expect-error allow timeline to be type jsPsych TimelineArray
  await jsPsych.run(timeline)
}
