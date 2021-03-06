/**
 * Copyright 2016 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the “License”);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an “AS IS” BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const acknowledge = require('../actions/acknowledge.js').main;
const assert = require('chai').assert;
const nock = require('nock');

describe('Acknowledge', () => {
  it('acknowledges a recommendation', (done) => {
    // intercept the cloudant delete
    nock('http://cloudant')
      .get('/recommendations/myRecommendationId')
      .reply(200, {
        _id: 'myRecommendationId',
        _rev: 12
      })
      .delete('/recommendations/myRecommendationId?rev=12')
      .reply(200, { ok: true });

    acknowledge({
      demoGuid: 'MyGUID',
      recommendationId: 'myRecommendationId',
      'services.cloudant.url': 'http://cloudant',
      'services.cloudant.database': 'recommendations'
    }).then((result) => {
      assert.equal(true, result.ok);
      done(null);
    });
  });

  it('handles failures of Cloudant during get', (done) => {
    // intercept the cloudant delete and fail
    nock('http://cloudant')
      .get('/recommendations/myRecommendationId')
      .reply(500);

    acknowledge({
      demoGuid: 'MyGUID',
      recommendationId: 'myRecommendationId',
      recommendationRev: '12',
      'services.cloudant.url': 'http://cloudant',
      'services.cloudant.database': 'recommendations'
    }).catch((err) => {
      assert.equal(false, err.ok);
      done(null);
    });
  });

  it('handles failures of Cloudant during delete', (done) => {
    // intercept the cloudant delete and fail
    nock('http://cloudant')
      .get('/recommendations/myRecommendationId')
      .reply(200, {
        _id: 'myRecommendationId',
        _rev: 12
      })
      .delete('/recommendations/myRecommendationId?rev=12')
      .reply(500);

    acknowledge({
      demoGuid: 'MyGUID',
      recommendationId: 'myRecommendationId',
      recommendationRev: '12',
      'services.cloudant.url': 'http://cloudant',
      'services.cloudant.database': 'recommendations'
    }).catch((err) => {
      assert.isOk(err);
      assert.equal(false, err.ok);
      done(null);
    });
  });
});
