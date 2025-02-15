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

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   generateProof: function() { return /* binding */ generateProof; }\n/* harmony export */ });\n/* harmony import */ var snarkjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! snarkjs */ \"./node_modules/snarkjs/build/browser.esm.js\");\n\nconst generateProof = async (secret, root, nullifierHash, recipient)=>{\n    try {\n        console.log(\"Generating proof with inputs:\", {\n            secret,\n            root,\n            nullifierHash,\n            recipient\n        });\n        if (!secret) throw new Error(\"Secret is undefined\");\n        if (!root) throw new Error(\"Root is undefined\");\n        if (!nullifierHash) throw new Error(\"NullifierHash is undefined\");\n        if (!recipient) throw new Error(\"Recipient is undefined\");\n        // Convert inputs to appropriate format\n        const secretBigInt = BigInt(\"0x\" + secret);\n        const rootBigInt = BigInt(root);\n        const nullifierHashBigInt = BigInt(nullifierHash);\n        const recipientBigInt = BigInt(recipient.replace(\"juno\", \"0x\"));\n        // Input for the circuit\n        const input = {\n            secret: secretBigInt.toString(),\n            root: rootBigInt.toString(),\n            nullifierHash: nullifierHashBigInt.toString(),\n            recipient: recipientBigInt.toString()\n        };\n        console.log(\"Circuit inputs:\", input);\n        // Load the circuit\n        const { proof, publicSignals } = await snarkjs__WEBPACK_IMPORTED_MODULE_0__.groth16.fullProve(input, \"/circuits/merkleproof.wasm\", \"/circuits/merkleproof_final.zkey\");\n        console.log(\"Generated proof:\", proof);\n        console.log(\"Public signals:\", publicSignals);\n        // Convert the proof to the format expected by the contract\n        const proofForContract = [\n            proof.pi_a[0],\n            proof.pi_a[1],\n            proof.pi_b[0][0],\n            proof.pi_b[0][1],\n            proof.pi_b[1][0],\n            proof.pi_b[1][1],\n            proof.pi_c[0],\n            proof.pi_c[1]\n        ].map((x)=>x.toString());\n        return proofForContract;\n    } catch (error) {\n        console.error(\"Error generating proof:\", error);\n        throw error;\n    }\n};\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi91dGlscy96a1Byb29mLmpzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQWtDO0FBRTNCLE1BQU1DLGdCQUFnQixPQUFPQyxRQUFRQyxNQUFNQyxlQUFlQztJQUMvRCxJQUFJO1FBQ0ZDLFFBQVFDLEdBQUcsQ0FBQyxpQ0FBaUM7WUFDM0NMO1lBQ0FDO1lBQ0FDO1lBQ0FDO1FBQ0Y7UUFFQSxJQUFJLENBQUNILFFBQVEsTUFBTSxJQUFJTSxNQUFNO1FBQzdCLElBQUksQ0FBQ0wsTUFBTSxNQUFNLElBQUlLLE1BQU07UUFDM0IsSUFBSSxDQUFDSixlQUFlLE1BQU0sSUFBSUksTUFBTTtRQUNwQyxJQUFJLENBQUNILFdBQVcsTUFBTSxJQUFJRyxNQUFNO1FBRWhDLHVDQUF1QztRQUN2QyxNQUFNQyxlQUFlQyxPQUFPLE9BQU9SO1FBQ25DLE1BQU1TLGFBQWFELE9BQU9QO1FBQzFCLE1BQU1TLHNCQUFzQkYsT0FBT047UUFDbkMsTUFBTVMsa0JBQWtCSCxPQUFPTCxVQUFVUyxPQUFPLENBQUMsUUFBUTtRQUV6RCx3QkFBd0I7UUFDeEIsTUFBTUMsUUFBUTtZQUNaYixRQUFRTyxhQUFhTyxRQUFRO1lBQzdCYixNQUFNUSxXQUFXSyxRQUFRO1lBQ3pCWixlQUFlUSxvQkFBb0JJLFFBQVE7WUFDM0NYLFdBQVdRLGdCQUFnQkcsUUFBUTtRQUNyQztRQUVBVixRQUFRQyxHQUFHLENBQUMsbUJBQW1CUTtRQUUvQixtQkFBbUI7UUFDbkIsTUFBTSxFQUFFRSxLQUFLLEVBQUVDLGFBQWEsRUFBRSxHQUFHLE1BQU1sQiw0Q0FBT0EsQ0FBQ21CLFNBQVMsQ0FDdERKLE9BQ0EsOEJBQ0E7UUFHRlQsUUFBUUMsR0FBRyxDQUFDLG9CQUFvQlU7UUFDaENYLFFBQVFDLEdBQUcsQ0FBQyxtQkFBbUJXO1FBRS9CLDJEQUEyRDtRQUMzRCxNQUFNRSxtQkFBbUI7WUFDdkJILE1BQU1JLElBQUksQ0FBQyxFQUFFO1lBQ2JKLE1BQU1JLElBQUksQ0FBQyxFQUFFO1lBQ2JKLE1BQU1LLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUNoQkwsTUFBTUssSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFO1lBQ2hCTCxNQUFNSyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUU7WUFDaEJMLE1BQU1LLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUNoQkwsTUFBTU0sSUFBSSxDQUFDLEVBQUU7WUFDYk4sTUFBTU0sSUFBSSxDQUFDLEVBQUU7U0FDZCxDQUFDQyxHQUFHLENBQUNDLENBQUFBLElBQUtBLEVBQUVULFFBQVE7UUFFckIsT0FBT0k7SUFDVCxFQUFFLE9BQU9NLE9BQU87UUFDZHBCLFFBQVFvQixLQUFLLENBQUMsMkJBQTJCQTtRQUN6QyxNQUFNQTtJQUNSO0FBQ0YsRUFBRSIsInNvdXJjZXMiOlsid2VicGFjazovL19OX0UvLi91dGlscy96a1Byb29mLmpzPzQ2ZDMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ3JvdGgxNiB9IGZyb20gJ3NuYXJranMnO1xuXG5leHBvcnQgY29uc3QgZ2VuZXJhdGVQcm9vZiA9IGFzeW5jIChzZWNyZXQsIHJvb3QsIG51bGxpZmllckhhc2gsIHJlY2lwaWVudCkgPT4ge1xuICB0cnkge1xuICAgIGNvbnNvbGUubG9nKCdHZW5lcmF0aW5nIHByb29mIHdpdGggaW5wdXRzOicsIHtcbiAgICAgIHNlY3JldCxcbiAgICAgIHJvb3QsXG4gICAgICBudWxsaWZpZXJIYXNoLFxuICAgICAgcmVjaXBpZW50XG4gICAgfSk7XG5cbiAgICBpZiAoIXNlY3JldCkgdGhyb3cgbmV3IEVycm9yKCdTZWNyZXQgaXMgdW5kZWZpbmVkJyk7XG4gICAgaWYgKCFyb290KSB0aHJvdyBuZXcgRXJyb3IoJ1Jvb3QgaXMgdW5kZWZpbmVkJyk7XG4gICAgaWYgKCFudWxsaWZpZXJIYXNoKSB0aHJvdyBuZXcgRXJyb3IoJ051bGxpZmllckhhc2ggaXMgdW5kZWZpbmVkJyk7XG4gICAgaWYgKCFyZWNpcGllbnQpIHRocm93IG5ldyBFcnJvcignUmVjaXBpZW50IGlzIHVuZGVmaW5lZCcpO1xuXG4gICAgLy8gQ29udmVydCBpbnB1dHMgdG8gYXBwcm9wcmlhdGUgZm9ybWF0XG4gICAgY29uc3Qgc2VjcmV0QmlnSW50ID0gQmlnSW50KCcweCcgKyBzZWNyZXQpO1xuICAgIGNvbnN0IHJvb3RCaWdJbnQgPSBCaWdJbnQocm9vdCk7XG4gICAgY29uc3QgbnVsbGlmaWVySGFzaEJpZ0ludCA9IEJpZ0ludChudWxsaWZpZXJIYXNoKTtcbiAgICBjb25zdCByZWNpcGllbnRCaWdJbnQgPSBCaWdJbnQocmVjaXBpZW50LnJlcGxhY2UoJ2p1bm8nLCAnMHgnKSk7XG5cbiAgICAvLyBJbnB1dCBmb3IgdGhlIGNpcmN1aXRcbiAgICBjb25zdCBpbnB1dCA9IHtcbiAgICAgIHNlY3JldDogc2VjcmV0QmlnSW50LnRvU3RyaW5nKCksXG4gICAgICByb290OiByb290QmlnSW50LnRvU3RyaW5nKCksXG4gICAgICBudWxsaWZpZXJIYXNoOiBudWxsaWZpZXJIYXNoQmlnSW50LnRvU3RyaW5nKCksXG4gICAgICByZWNpcGllbnQ6IHJlY2lwaWVudEJpZ0ludC50b1N0cmluZygpLFxuICAgIH07XG5cbiAgICBjb25zb2xlLmxvZygnQ2lyY3VpdCBpbnB1dHM6JywgaW5wdXQpO1xuXG4gICAgLy8gTG9hZCB0aGUgY2lyY3VpdFxuICAgIGNvbnN0IHsgcHJvb2YsIHB1YmxpY1NpZ25hbHMgfSA9IGF3YWl0IGdyb3RoMTYuZnVsbFByb3ZlKFxuICAgICAgaW5wdXQsXG4gICAgICBcIi9jaXJjdWl0cy9tZXJrbGVwcm9vZi53YXNtXCIsXG4gICAgICBcIi9jaXJjdWl0cy9tZXJrbGVwcm9vZl9maW5hbC56a2V5XCJcbiAgICApO1xuXG4gICAgY29uc29sZS5sb2coJ0dlbmVyYXRlZCBwcm9vZjonLCBwcm9vZik7XG4gICAgY29uc29sZS5sb2coJ1B1YmxpYyBzaWduYWxzOicsIHB1YmxpY1NpZ25hbHMpO1xuXG4gICAgLy8gQ29udmVydCB0aGUgcHJvb2YgdG8gdGhlIGZvcm1hdCBleHBlY3RlZCBieSB0aGUgY29udHJhY3RcbiAgICBjb25zdCBwcm9vZkZvckNvbnRyYWN0ID0gW1xuICAgICAgcHJvb2YucGlfYVswXSxcbiAgICAgIHByb29mLnBpX2FbMV0sXG4gICAgICBwcm9vZi5waV9iWzBdWzBdLFxuICAgICAgcHJvb2YucGlfYlswXVsxXSxcbiAgICAgIHByb29mLnBpX2JbMV1bMF0sXG4gICAgICBwcm9vZi5waV9iWzFdWzFdLFxuICAgICAgcHJvb2YucGlfY1swXSxcbiAgICAgIHByb29mLnBpX2NbMV0sXG4gICAgXS5tYXAoeCA9PiB4LnRvU3RyaW5nKCkpO1xuXG4gICAgcmV0dXJuIHByb29mRm9yQ29udHJhY3Q7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2VuZXJhdGluZyBwcm9vZjonLCBlcnJvcik7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn07ICJdLCJuYW1lcyI6WyJncm90aDE2IiwiZ2VuZXJhdGVQcm9vZiIsInNlY3JldCIsInJvb3QiLCJudWxsaWZpZXJIYXNoIiwicmVjaXBpZW50IiwiY29uc29sZSIsImxvZyIsIkVycm9yIiwic2VjcmV0QmlnSW50IiwiQmlnSW50Iiwicm9vdEJpZ0ludCIsIm51bGxpZmllckhhc2hCaWdJbnQiLCJyZWNpcGllbnRCaWdJbnQiLCJyZXBsYWNlIiwiaW5wdXQiLCJ0b1N0cmluZyIsInByb29mIiwicHVibGljU2lnbmFscyIsImZ1bGxQcm92ZSIsInByb29mRm9yQ29udHJhY3QiLCJwaV9hIiwicGlfYiIsInBpX2MiLCJtYXAiLCJ4IiwiZXJyb3IiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./utils/zkProof.js\n"));

/***/ })

});