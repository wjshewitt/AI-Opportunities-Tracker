import { Recommendation } from './types';

export type SourceMetadata = {
  actionPlanPage?: number;
  actionPlanSection?: string;
  govResponsePage?: number;
  govResponseSection?: string;
};

export const SOURCE_METADATA: Record<string, SourceMetadata> = {
  "R01": {
    "actionPlanPage": 7,
    "actionPlanSection": "1.1 Building sufficient, secure and sustainable AI infrastructure",
    "govResponsePage": 9,
    "govResponseSection": "Building sufficient, secure, and sustainable infrastructure"
  },
  "R02": {
    "actionPlanPage": 7,
    "actionPlanSection": "1.1 Building sufficient, secure and sustainable AI infrastructure",
    "govResponsePage": 9,
    "govResponseSection": "Building sufficient, secure, and sustainable infrastructure"
  },
  "R03": {
    "actionPlanPage": 7,
    "actionPlanSection": "1.1 Building sufficient, secure and sustainable AI infrastructure",
    "govResponsePage": 9,
    "govResponseSection": "Building sufficient, secure, and sustainable infrastructure"
  },
  "R04": {
    "actionPlanPage": 7,
    "actionPlanSection": "1.1 Building sufficient, secure and sustainable AI infrastructure",
    "govResponsePage": 9,
    "govResponseSection": "Building sufficient, secure, and sustainable infrastructure"
  },
  "R05": {
    "actionPlanPage": 7,
    "actionPlanSection": "1.1 Building sufficient, secure and sustainable AI infrastructure",
    "govResponsePage": 10,
    "govResponseSection": "Building sufficient, secure, and sustainable infrastructure"
  },
  "R06": {
    "actionPlanPage": 7,
    "actionPlanSection": "1.1 Building sufficient, secure and sustainable AI infrastructure",
    "govResponsePage": 10,
    "govResponseSection": "Building sufficient, secure, and sustainable infrastructure"
  },
  "R07": {
    "actionPlanPage": 9,
    "actionPlanSection": "1.2 Unlocking data assets in the public and private sector",
    "govResponsePage": 10,
    "govResponseSection": "Unlocking data assets in the public and private sector"
  },
  "R08": {
    "actionPlanPage": 9,
    "actionPlanSection": "1.2 Unlocking data assets in the public and private sector",
    "govResponsePage": 10,
    "govResponseSection": "Unlocking data assets in the public and private sector"
  },
  "R09": {
    "actionPlanPage": 9,
    "actionPlanSection": "1.2 Unlocking data assets in the public and private sector",
    "govResponsePage": 11,
    "govResponseSection": "Unlocking data assets in the public and private sector"
  },
  "R10": {
    "actionPlanPage": 9,
    "actionPlanSection": "1.2 Unlocking data assets in the public and private sector",
    "govResponsePage": 11,
    "govResponseSection": "Unlocking data assets in the public and private sector"
  },
  "R11": {
    "actionPlanPage": 9,
    "actionPlanSection": "1.2 Unlocking data assets in the public and private sector",
    "govResponsePage": 11,
    "govResponseSection": "Unlocking data assets in the public and private sector"
  },
  "R12": {
    "actionPlanPage": 9,
    "actionPlanSection": "1.2 Unlocking data assets in the public and private sector",
    "govResponsePage": 11,
    "govResponseSection": "Unlocking data assets in the public and private sector"
  },
  "R13": {
    "actionPlanPage": 9,
    "actionPlanSection": "1.2 Unlocking data assets in the public and private sector",
    "govResponsePage": 11,
    "govResponseSection": "Unlocking data assets in the public and private sector"
  },
  "R14": {
    "actionPlanPage": 10,
    "actionPlanSection": "1.3 Training, retaining, and attracting the next generation of AI scientists and founders",
    "govResponsePage": 12,
    "govResponseSection": "Training, retaining and attracting the next generation of AI scientists and founders"
  },
  "R15": {
    "actionPlanPage": 10,
    "actionPlanSection": "1.3 Training, retaining, and attracting the next generation of AI scientists and founders",
    "govResponsePage": 12,
    "govResponseSection": "Training, retaining and attracting the next generation of AI scientists and founders"
  },
  "R16": {
    "actionPlanPage": 10,
    "actionPlanSection": "1.3 Training, retaining, and attracting the next generation of AI scientists and founders",
    "govResponsePage": 12,
    "govResponseSection": "Training, retaining and attracting the next generation of AI scientists and founders"
  },
  "R17": {
    "actionPlanPage": 10,
    "actionPlanSection": "1.3 Training, retaining, and attracting the next generation of AI scientists and founders",
    "govResponsePage": 12,
    "govResponseSection": "Training, retaining and attracting the next generation of AI scientists and founders"
  },
  "R18": {
    "actionPlanPage": 10,
    "actionPlanSection": "1.3 Training, retaining, and attracting the next generation of AI scientists and founders",
    "govResponsePage": 13,
    "govResponseSection": "Training, retaining and attracting the next generation of AI scientists and founders"
  },
  "R19": {
    "actionPlanPage": 10,
    "actionPlanSection": "1.3 Training, retaining, and attracting the next generation of AI scientists and founders",
    "govResponsePage": 13,
    "govResponseSection": "Training, retaining and attracting the next generation of AI scientists and founders"
  },
  "R20": {
    "actionPlanPage": 10,
    "actionPlanSection": "1.3 Training, retaining, and attracting the next generation of AI scientists and founders",
    "govResponsePage": 13,
    "govResponseSection": "Training, retaining and attracting the next generation of AI scientists and founders"
  },
  "R21": {
    "actionPlanPage": 10,
    "actionPlanSection": "1.3 Training, retaining, and attracting the next generation of AI scientists and founders",
    "govResponsePage": 13,
    "govResponseSection": "Training, retaining and attracting the next generation of AI scientists and founders"
  },
  "R22": {
    "actionPlanPage": 10,
    "actionPlanSection": "1.3 Training, retaining, and attracting the next generation of AI scientists and founders",
    "govResponsePage": 14,
    "govResponseSection": "Training, retaining and attracting the next generation of AI scientists and founders"
  },
  "R23": {
    "actionPlanPage": 13,
    "actionPlanSection": "1.4 Enabling safe and trusted AI development and adoption through regulation, safety and assurance",
    "govResponsePage": 14,
    "govResponseSection": "Enabling safe and trusted AI development through regulation, safety and assurance"
  },
  "R24": {
    "actionPlanPage": 13,
    "actionPlanSection": "1.4 Enabling safe and trusted AI development and adoption through regulation, safety and assurance",
    "govResponsePage": 14,
    "govResponseSection": "Enabling safe and trusted AI development through regulation, safety and assurance"
  },
  "R25": {
    "actionPlanPage": 13,
    "actionPlanSection": "1.4 Enabling safe and trusted AI development and adoption through regulation, safety and assurance",
    "govResponsePage": 14,
    "govResponseSection": "Enabling safe and trusted AI development through regulation, safety and assurance"
  },
  "R26": {
    "actionPlanPage": 13,
    "actionPlanSection": "1.4 Enabling safe and trusted AI development and adoption through regulation, safety and assurance",
    "govResponsePage": 15,
    "govResponseSection": "Enabling safe and trusted AI development through regulation, safety and assurance"
  },
  "R27": {
    "actionPlanPage": 13,
    "actionPlanSection": "1.4 Enabling safe and trusted AI development and adoption through regulation, safety and assurance",
    "govResponsePage": 15,
    "govResponseSection": "Enabling safe and trusted AI development through regulation, safety and assurance"
  },
  "R28": {
    "actionPlanPage": 13,
    "actionPlanSection": "1.4 Enabling safe and trusted AI development and adoption through regulation, safety and assurance",
    "govResponsePage": 15,
    "govResponseSection": "Enabling safe and trusted AI development through regulation, safety and assurance"
  },
  "R29": {
    "actionPlanPage": 13,
    "actionPlanSection": "1.4 Enabling safe and trusted AI development and adoption through regulation, safety and assurance",
    "govResponsePage": 16,
    "govResponseSection": "Enabling safe and trusted AI development through regulation, safety and assurance"
  },
  "R30": {
    "actionPlanPage": 13,
    "actionPlanSection": "1.4 Enabling safe and trusted AI development and adoption through regulation, safety and assurance",
    "govResponsePage": 16,
    "govResponseSection": "Enabling safe and trusted AI development through regulation, safety and assurance"
  },
  "R31": {
    "actionPlanPage": 17,
    "actionPlanSection": "2.2 Adopt a 'Scan -> Pilot -> Scale' approach in government",
    "govResponsePage": 16,
    "govResponseSection": "Adopt a \"scan -> pilot -> scale\" approach in government"
  },
  "R32": {
    "actionPlanPage": 17,
    "actionPlanSection": "2.2 Adopt a 'Scan -> Pilot -> Scale' approach in government",
    "govResponsePage": 17,
    "govResponseSection": "Adopt a \"scan -> pilot -> scale\" approach in government"
  },
  "R33": {
    "actionPlanPage": 17,
    "actionPlanSection": "2.2 Adopt a 'Scan -> Pilot -> Scale' approach in government",
    "govResponsePage": 17,
    "govResponseSection": "Adopt a \"scan -> pilot -> scale\" approach in government"
  },
  "R34": {
    "actionPlanPage": 17,
    "actionPlanSection": "2.2 Adopt a 'Scan -> Pilot -> Scale' approach in government",
    "govResponsePage": 17,
    "govResponseSection": "Adopt a \"scan -> pilot -> scale\" approach in government"
  },
  "R35": {
    "actionPlanPage": 17,
    "actionPlanSection": "2.2 Adopt a 'Scan -> Pilot -> Scale' approach in government",
    "govResponsePage": 17,
    "govResponseSection": "Adopt a \"scan -> pilot -> scale\" approach in government"
  },
  "R36": {
    "actionPlanPage": 17,
    "actionPlanSection": "2.2 Adopt a 'Scan -> Pilot -> Scale' approach in government",
    "govResponsePage": 17,
    "govResponseSection": "Adopt a \"scan -> pilot -> scale\" approach in government"
  },
  "R37": {
    "actionPlanPage": 17,
    "actionPlanSection": "2.2 Adopt a 'Scan -> Pilot -> Scale' approach in government",
    "govResponsePage": 18,
    "govResponseSection": "Adopt a \"scan -> pilot -> scale\" approach in government"
  },
  "R38": {
    "actionPlanPage": 17,
    "actionPlanSection": "2.2 Adopt a 'Scan -> Pilot -> Scale' approach in government",
    "govResponsePage": 18,
    "govResponseSection": "Adopt a \"scan -> pilot -> scale\" approach in government"
  },
  "R39": {
    "actionPlanPage": 17,
    "actionPlanSection": "2.2 Adopt a 'Scan -> Pilot -> Scale' approach in government",
    "govResponsePage": 18,
    "govResponseSection": "Adopt a \"scan -> pilot -> scale\" approach in government"
  },
  "R40": {
    "actionPlanPage": 17,
    "actionPlanSection": "2.2 Adopt a 'Scan -> Pilot -> Scale' approach in government",
    "govResponsePage": 18,
    "govResponseSection": "Adopt a \"scan -> pilot -> scale\" approach in government"
  },
  "R41": {
    "actionPlanPage": 17,
    "actionPlanSection": "2.2 Adopt a 'Scan -> Pilot -> Scale' approach in government",
    "govResponsePage": 18,
    "govResponseSection": "Adopt a \"scan -> pilot -> scale\" approach in government"
  },
  "R42": {
    "actionPlanPage": 17,
    "actionPlanSection": "2.2 Adopt a 'Scan -> Pilot -> Scale' approach in government",
    "govResponsePage": 19,
    "govResponseSection": "Adopt a \"scan -> pilot -> scale\" approach in government"
  },
  "R43": {
    "actionPlanPage": 19,
    "actionPlanSection": "2.3 Enable public and private sectors to reinforce each other",
    "govResponsePage": 19,
    "govResponseSection": "Enable public and private sectors to reinforce each other"
  },
  "R44": {
    "actionPlanPage": 19,
    "actionPlanSection": "2.3 Enable public and private sectors to reinforce each other",
    "govResponsePage": 19,
    "govResponseSection": "Enable public and private sectors to reinforce each other"
  },
  "R45": {
    "actionPlanPage": 19,
    "actionPlanSection": "2.3 Enable public and private sectors to reinforce each other",
    "govResponsePage": 19,
    "govResponseSection": "Enable public and private sectors to reinforce each other"
  },
  "R46": {
    "actionPlanPage": 19,
    "actionPlanSection": "2.3 Enable public and private sectors to reinforce each other",
    "govResponsePage": 19,
    "govResponseSection": "Enable public and private sectors to reinforce each other"
  },
  "R47": {
    "actionPlanPage": 19,
    "actionPlanSection": "2.4 Address private-sector-user-adoption barriers",
    "govResponsePage": 20,
    "govResponseSection": "Address private-sector-user adoption barriers"
  },
  "R48": {
    "actionPlanPage": 19,
    "actionPlanSection": "2.4 Address private-sector-user-adoption barriers",
    "govResponsePage": 20,
    "govResponseSection": "Address private-sector-user adoption barriers"
  },
  "R49": {
    "actionPlanPage": 19,
    "actionPlanSection": "2.4 Address private-sector-user-adoption barriers",
    "govResponsePage": 21,
    "govResponseSection": "Address private-sector-user adoption barriers"
  },
  "R50": {
    "actionPlanPage": 21,
    "actionPlanSection": "3. Secure our future with homegrown AI",
    "govResponsePage": 21,
    "govResponseSection": "Advancing AI"
  }
};

export function applySourceMetadata(recs: Recommendation[]): Recommendation[] {
  return recs.map((rec) => {
    const meta = SOURCE_METADATA[rec.id];
    return meta ? { ...rec, ...meta } : rec;
  });
}
