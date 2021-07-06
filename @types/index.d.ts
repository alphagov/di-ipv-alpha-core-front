/*!
 * MIT License
 *
 * Copyright (c) 2021 Government Digital Service
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

interface GADataLayerData {
  timestamp: string;
  language: string;
}

interface Passport {
  number?: string;
  surname?: string;
  givenName?: string;
  dob?: DateInput;
  issued?: DateInput;
  expired?: DateInput;
}

interface DateInput {
  day: string;
  month: string;
  year: string;
}

namespace GPG45 {
  export enum EvidenceType {
    UK_PASSPORT = "UK_PASSPORT",
    ATP_GENERIC_DATA = "ATP_GENERIC_DATA"
  }

  export interface EvidenceData {
    data: any;
  }

  export enum AuthoritativeSource {
    IPV_ATP_DCS = "urn:di:ipv:atp-dcs",
    ANY = ""
  }

  export interface ValidityChecks {
    original: string;
    errors: string;
    details: string;
    logos: string;
    consistent: string;
    authoritativeSource: AuthoritativeSource;
    visibleSecurityFeatures: string;
    specialistLightSecurityFeatures: string;
    physicalSecurityFeatures: string;
    cryptographicCheck: string;
    lostStolenCancelled: string;
    expired: string;
  }

  export enum Score {
    NOT_AVAILABLE = 0,
    ONE = 1,
    TWO = 2,
    THREE = 3,
    FOUR = 4
  }

  export interface EvidenceScores {
    strength: Score;
    validity: Score;
  }

  export interface IdentityEvidence {
    uuid: any;
    type: EvidenceType;
    evidenceData: EvidenceData;
    validityChecks: ValidityChecks;
    evidenceScores: EvidenceScores;
  }

  export enum IdentityCheck {
    NONE = "None",
    PUBLISHED_POLICY = "PublishedPolicy",
    ANTI_MONEY_LAUNDERING = "AntiMoneyLaundering",
    PHYSICAL_BIOMETRIC = "PhysicalBiometric"
  }

  export interface ActivityCheckSource {
    type: string;
    identityCheck: IdentityCheck;
  }

  export interface ActivityCheck {
    source: ActivityCheckSource;
    dates: [string];
  }

  export interface FraudCheck {
    level: string;
    fraudIndicators: [any];
  }

  export enum Quality {
    LOW = "Low",
    MEDIUM = "Medium",
    HIGH = "High"
  }

  export interface KBV {
    quality: Quality;
    question: string;
    response: string;
  }

  export interface IdentityVerification {
    staticKbv: [KBV];
    photoMatch: string;
    biometricMatch: string;
    dynamicKbv: [KBV];
  }

  export interface BundleScores {
    activityCheckScore: Score;
    fraudCheckScore: Score;
    identityVerificationScore: Score;
  }

  export interface IdentityVerificationBundle {
    identityEvidence: [IdentityEvidence];
    activityChecks: [ActivityCheck];
    fraudCheck: FraudCheck;
    identityVerification: IdentityVerification;
    bundleScores: BundleScores;
  }
}