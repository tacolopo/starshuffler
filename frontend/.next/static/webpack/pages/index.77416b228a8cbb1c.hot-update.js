"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("pages/index",{

/***/ "./utils/zkProof.js":
/*!**************************!*\
  !*** ./utils/zkProof.js ***!
  \**************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   generateProof: function() { return /* binding */ generateProof; }\n/* harmony export */ });\n/* harmony import */ var snarkjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! snarkjs */ \"./node_modules/snarkjs/build/browser.esm.js\");\n/* harmony import */ var _merkleTree__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./merkleTree */ \"./utils/merkleTree.js\");\n\n\nconst addressToNumber = (address)=>{\n    // Remove the 'juno' prefix\n    const addressWithoutPrefix = address.replace(\"juno\", \"\");\n    // Convert the remaining characters to a number\n    let result = \"\";\n    for(let i = 0; i < addressWithoutPrefix.length; i++){\n        result += addressWithoutPrefix.charCodeAt(i).toString(16);\n    }\n    return BigInt(\"0x\" + result);\n};\nconst generateProof = async (secret, commitment, allCommitments, recipient)=>{\n    try {\n        console.log(\"Generating proof with inputs:\", {\n            secret,\n            commitment,\n            recipient\n        });\n        if (!secret) throw new Error(\"Secret is undefined\");\n        if (!commitment) throw new Error(\"Commitment is undefined\");\n        if (!recipient) throw new Error(\"Recipient is undefined\");\n        // Convert secret to BigInt\n        const secretBigInt = BigInt(\"0x\" + secret);\n        // Generate Merkle proof\n        console.log(\"Generating Merkle proof...\");\n        const merkleProof = await (0,_merkleTree__WEBPACK_IMPORTED_MODULE_1__.createMerkleProof)(commitment, allCommitments);\n        console.log(\"Merkle proof:\", merkleProof);\n        // Input for the circuit - only include what the circuit expects\n        const input = {\n            leaf: secretBigInt.toString(),\n            pathElements: merkleProof.pathElements,\n            pathIndices: merkleProof.pathIndices\n        };\n        console.log(\"Circuit inputs:\", input);\n        // Load the circuit - using the correct paths\n        const { proof, publicSignals } = await snarkjs__WEBPACK_IMPORTED_MODULE_0__.groth16.fullProve(input, \"/merkleproof_js/merkleproof.wasm\", \"/merkleproof_final.zkey\");\n        console.log(\"Generated proof:\", proof);\n        console.log(\"Public signals:\", publicSignals);\n        // Convert the proof to the format expected by the contract\n        const proofForContract = [\n            proof.pi_a[0],\n            proof.pi_a[1],\n            proof.pi_b[0][0],\n            proof.pi_b[0][1],\n            proof.pi_b[1][0],\n            proof.pi_b[1][1],\n            proof.pi_c[0],\n            proof.pi_c[1]\n        ].map((x)=>x.toString());\n        return proofForContract;\n    } catch (error) {\n        console.error(\"Error generating proof:\", error);\n        throw error;\n    }\n};\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi91dGlscy96a1Byb29mLmpzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUFrQztBQUNlO0FBRWpELE1BQU1FLGtCQUFrQixDQUFDQztJQUN2QiwyQkFBMkI7SUFDM0IsTUFBTUMsdUJBQXVCRCxRQUFRRSxPQUFPLENBQUMsUUFBUTtJQUVyRCwrQ0FBK0M7SUFDL0MsSUFBSUMsU0FBUztJQUNiLElBQUssSUFBSUMsSUFBSSxHQUFHQSxJQUFJSCxxQkFBcUJJLE1BQU0sRUFBRUQsSUFBSztRQUNwREQsVUFBVUYscUJBQXFCSyxVQUFVLENBQUNGLEdBQUdHLFFBQVEsQ0FBQztJQUN4RDtJQUNBLE9BQU9DLE9BQU8sT0FBT0w7QUFDdkI7QUFFTyxNQUFNTSxnQkFBZ0IsT0FBT0MsUUFBUUMsWUFBWUMsZ0JBQWdCQztJQUN0RSxJQUFJO1FBQ0ZDLFFBQVFDLEdBQUcsQ0FBQyxpQ0FBaUM7WUFDM0NMO1lBQ0FDO1lBQ0FFO1FBQ0Y7UUFFQSxJQUFJLENBQUNILFFBQVEsTUFBTSxJQUFJTSxNQUFNO1FBQzdCLElBQUksQ0FBQ0wsWUFBWSxNQUFNLElBQUlLLE1BQU07UUFDakMsSUFBSSxDQUFDSCxXQUFXLE1BQU0sSUFBSUcsTUFBTTtRQUVoQywyQkFBMkI7UUFDM0IsTUFBTUMsZUFBZVQsT0FBTyxPQUFPRTtRQUVuQyx3QkFBd0I7UUFDeEJJLFFBQVFDLEdBQUcsQ0FBQztRQUNaLE1BQU1HLGNBQWMsTUFBTXBCLDhEQUFpQkEsQ0FBQ2EsWUFBWUM7UUFDeERFLFFBQVFDLEdBQUcsQ0FBQyxpQkFBaUJHO1FBRTdCLGdFQUFnRTtRQUNoRSxNQUFNQyxRQUFRO1lBQ1pDLE1BQU1ILGFBQWFWLFFBQVE7WUFDM0JjLGNBQWNILFlBQVlHLFlBQVk7WUFDdENDLGFBQWFKLFlBQVlJLFdBQVc7UUFDdEM7UUFFQVIsUUFBUUMsR0FBRyxDQUFDLG1CQUFtQkk7UUFFL0IsNkNBQTZDO1FBQzdDLE1BQU0sRUFBRUksS0FBSyxFQUFFQyxhQUFhLEVBQUUsR0FBRyxNQUFNM0IsNENBQU9BLENBQUM0QixTQUFTLENBQ3RETixPQUNBLG9DQUNBO1FBR0ZMLFFBQVFDLEdBQUcsQ0FBQyxvQkFBb0JRO1FBQ2hDVCxRQUFRQyxHQUFHLENBQUMsbUJBQW1CUztRQUUvQiwyREFBMkQ7UUFDM0QsTUFBTUUsbUJBQW1CO1lBQ3ZCSCxNQUFNSSxJQUFJLENBQUMsRUFBRTtZQUNiSixNQUFNSSxJQUFJLENBQUMsRUFBRTtZQUNiSixNQUFNSyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUU7WUFDaEJMLE1BQU1LLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUNoQkwsTUFBTUssSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFO1lBQ2hCTCxNQUFNSyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUU7WUFDaEJMLE1BQU1NLElBQUksQ0FBQyxFQUFFO1lBQ2JOLE1BQU1NLElBQUksQ0FBQyxFQUFFO1NBQ2QsQ0FBQ0MsR0FBRyxDQUFDQyxDQUFBQSxJQUFLQSxFQUFFeEIsUUFBUTtRQUVyQixPQUFPbUI7SUFDVCxFQUFFLE9BQU9NLE9BQU87UUFDZGxCLFFBQVFrQixLQUFLLENBQUMsMkJBQTJCQTtRQUN6QyxNQUFNQTtJQUNSO0FBQ0YsRUFBRSIsInNvdXJjZXMiOlsid2VicGFjazovL19OX0UvLi91dGlscy96a1Byb29mLmpzPzQ2ZDMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ3JvdGgxNiB9IGZyb20gJ3NuYXJranMnO1xuaW1wb3J0IHsgY3JlYXRlTWVya2xlUHJvb2YgfSBmcm9tICcuL21lcmtsZVRyZWUnO1xuXG5jb25zdCBhZGRyZXNzVG9OdW1iZXIgPSAoYWRkcmVzcykgPT4ge1xuICAvLyBSZW1vdmUgdGhlICdqdW5vJyBwcmVmaXhcbiAgY29uc3QgYWRkcmVzc1dpdGhvdXRQcmVmaXggPSBhZGRyZXNzLnJlcGxhY2UoJ2p1bm8nLCAnJyk7XG4gIFxuICAvLyBDb252ZXJ0IHRoZSByZW1haW5pbmcgY2hhcmFjdGVycyB0byBhIG51bWJlclxuICBsZXQgcmVzdWx0ID0gJyc7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYWRkcmVzc1dpdGhvdXRQcmVmaXgubGVuZ3RoOyBpKyspIHtcbiAgICByZXN1bHQgKz0gYWRkcmVzc1dpdGhvdXRQcmVmaXguY2hhckNvZGVBdChpKS50b1N0cmluZygxNik7XG4gIH1cbiAgcmV0dXJuIEJpZ0ludCgnMHgnICsgcmVzdWx0KTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZW5lcmF0ZVByb29mID0gYXN5bmMgKHNlY3JldCwgY29tbWl0bWVudCwgYWxsQ29tbWl0bWVudHMsIHJlY2lwaWVudCkgPT4ge1xuICB0cnkge1xuICAgIGNvbnNvbGUubG9nKCdHZW5lcmF0aW5nIHByb29mIHdpdGggaW5wdXRzOicsIHtcbiAgICAgIHNlY3JldCxcbiAgICAgIGNvbW1pdG1lbnQsXG4gICAgICByZWNpcGllbnRcbiAgICB9KTtcblxuICAgIGlmICghc2VjcmV0KSB0aHJvdyBuZXcgRXJyb3IoJ1NlY3JldCBpcyB1bmRlZmluZWQnKTtcbiAgICBpZiAoIWNvbW1pdG1lbnQpIHRocm93IG5ldyBFcnJvcignQ29tbWl0bWVudCBpcyB1bmRlZmluZWQnKTtcbiAgICBpZiAoIXJlY2lwaWVudCkgdGhyb3cgbmV3IEVycm9yKCdSZWNpcGllbnQgaXMgdW5kZWZpbmVkJyk7XG5cbiAgICAvLyBDb252ZXJ0IHNlY3JldCB0byBCaWdJbnRcbiAgICBjb25zdCBzZWNyZXRCaWdJbnQgPSBCaWdJbnQoJzB4JyArIHNlY3JldCk7XG5cbiAgICAvLyBHZW5lcmF0ZSBNZXJrbGUgcHJvb2ZcbiAgICBjb25zb2xlLmxvZygnR2VuZXJhdGluZyBNZXJrbGUgcHJvb2YuLi4nKTtcbiAgICBjb25zdCBtZXJrbGVQcm9vZiA9IGF3YWl0IGNyZWF0ZU1lcmtsZVByb29mKGNvbW1pdG1lbnQsIGFsbENvbW1pdG1lbnRzKTtcbiAgICBjb25zb2xlLmxvZygnTWVya2xlIHByb29mOicsIG1lcmtsZVByb29mKTtcblxuICAgIC8vIElucHV0IGZvciB0aGUgY2lyY3VpdCAtIG9ubHkgaW5jbHVkZSB3aGF0IHRoZSBjaXJjdWl0IGV4cGVjdHNcbiAgICBjb25zdCBpbnB1dCA9IHtcbiAgICAgIGxlYWY6IHNlY3JldEJpZ0ludC50b1N0cmluZygpLFxuICAgICAgcGF0aEVsZW1lbnRzOiBtZXJrbGVQcm9vZi5wYXRoRWxlbWVudHMsXG4gICAgICBwYXRoSW5kaWNlczogbWVya2xlUHJvb2YucGF0aEluZGljZXNcbiAgICB9O1xuXG4gICAgY29uc29sZS5sb2coJ0NpcmN1aXQgaW5wdXRzOicsIGlucHV0KTtcblxuICAgIC8vIExvYWQgdGhlIGNpcmN1aXQgLSB1c2luZyB0aGUgY29ycmVjdCBwYXRoc1xuICAgIGNvbnN0IHsgcHJvb2YsIHB1YmxpY1NpZ25hbHMgfSA9IGF3YWl0IGdyb3RoMTYuZnVsbFByb3ZlKFxuICAgICAgaW5wdXQsXG4gICAgICBcIi9tZXJrbGVwcm9vZl9qcy9tZXJrbGVwcm9vZi53YXNtXCIsXG4gICAgICBcIi9tZXJrbGVwcm9vZl9maW5hbC56a2V5XCJcbiAgICApO1xuXG4gICAgY29uc29sZS5sb2coJ0dlbmVyYXRlZCBwcm9vZjonLCBwcm9vZik7XG4gICAgY29uc29sZS5sb2coJ1B1YmxpYyBzaWduYWxzOicsIHB1YmxpY1NpZ25hbHMpO1xuXG4gICAgLy8gQ29udmVydCB0aGUgcHJvb2YgdG8gdGhlIGZvcm1hdCBleHBlY3RlZCBieSB0aGUgY29udHJhY3RcbiAgICBjb25zdCBwcm9vZkZvckNvbnRyYWN0ID0gW1xuICAgICAgcHJvb2YucGlfYVswXSxcbiAgICAgIHByb29mLnBpX2FbMV0sXG4gICAgICBwcm9vZi5waV9iWzBdWzBdLFxuICAgICAgcHJvb2YucGlfYlswXVsxXSxcbiAgICAgIHByb29mLnBpX2JbMV1bMF0sXG4gICAgICBwcm9vZi5waV9iWzFdWzFdLFxuICAgICAgcHJvb2YucGlfY1swXSxcbiAgICAgIHByb29mLnBpX2NbMV0sXG4gICAgXS5tYXAoeCA9PiB4LnRvU3RyaW5nKCkpO1xuXG4gICAgcmV0dXJuIHByb29mRm9yQ29udHJhY3Q7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2VuZXJhdGluZyBwcm9vZjonLCBlcnJvcik7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn07ICJdLCJuYW1lcyI6WyJncm90aDE2IiwiY3JlYXRlTWVya2xlUHJvb2YiLCJhZGRyZXNzVG9OdW1iZXIiLCJhZGRyZXNzIiwiYWRkcmVzc1dpdGhvdXRQcmVmaXgiLCJyZXBsYWNlIiwicmVzdWx0IiwiaSIsImxlbmd0aCIsImNoYXJDb2RlQXQiLCJ0b1N0cmluZyIsIkJpZ0ludCIsImdlbmVyYXRlUHJvb2YiLCJzZWNyZXQiLCJjb21taXRtZW50IiwiYWxsQ29tbWl0bWVudHMiLCJyZWNpcGllbnQiLCJjb25zb2xlIiwibG9nIiwiRXJyb3IiLCJzZWNyZXRCaWdJbnQiLCJtZXJrbGVQcm9vZiIsImlucHV0IiwibGVhZiIsInBhdGhFbGVtZW50cyIsInBhdGhJbmRpY2VzIiwicHJvb2YiLCJwdWJsaWNTaWduYWxzIiwiZnVsbFByb3ZlIiwicHJvb2ZGb3JDb250cmFjdCIsInBpX2EiLCJwaV9iIiwicGlfYyIsIm1hcCIsIngiLCJlcnJvciJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./utils/zkProof.js\n"));

/***/ })

});