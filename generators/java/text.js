/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Generating Java for text blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.Java.texts');

goog.require('Blockly.Java');


Blockly.Java['text'] = function(block) {
  // Text value.
  var code = Blockly.Java.quote_(block.getFieldValue('TEXT'));
  return [code, Blockly.Java.ORDER_ATOMIC];
};

Blockly.Java['text_join'] = function(block) {
  // Create a string made up of any number of elements of any type.
  //Should we allow joining by '-' or ',' or any other characters?
  var code;
  if (block.itemCount_ == 0) {
    return ['\'\'', Blockly.Java.ORDER_ATOMIC];
  } else if (block.itemCount_ == 1) {
    var argument0 = Blockly.Java.valueToCode(block, 'ADD0',
        Blockly.Java.ORDER_NONE) || '\'\'';
    code = 'str(' + argument0 + ')';
    return [code, Blockly.Java.ORDER_FUNCTION_CALL];
  } else if (block.itemCount_ == 2) {
    var argument0 = Blockly.Java.valueToCode(block, 'ADD0',
        Blockly.Java.ORDER_NONE) || '\'\'';
    var argument1 = Blockly.Java.valueToCode(block, 'ADD1',
        Blockly.Java.ORDER_NONE) || '\'\'';
    var code = 'str(' + argument0 + ') + str(' + argument1 + ')';
    return [code, Blockly.Java.ORDER_UNARY_SIGN];
  } else {
    var code = [];
    for (var n = 0; n < block.itemCount_; n++) {
      code[n] = Blockly.Java.valueToCode(block, 'ADD' + n,
          Blockly.Java.ORDER_NONE) || '\'\'';
    }
    var tempVar = Blockly.Java.variableDB_.getDistinctName('temp_value',
        Blockly.Variables.NAME_TYPE);
    code = '\'\'.join([str(' + tempVar + ') for ' + tempVar + ' in [' +
        code.join(', ') + ']])';
    return [code, Blockly.Java.ORDER_FUNCTION_CALL];
  }
};

Blockly.Java['text_append'] = function(block) {
  // Append to a variable in place.
  var varName = Blockly.Java.variableDB_.getName(block.getFieldValue('VAR'),
      Blockly.Variables.NAME_TYPE);
  var argument0 = Blockly.Java.valueToCode(block, 'TEXT',
      Blockly.Java.ORDER_NONE) || '\'\'';
  return varName + ' = str(' + varName + ') + str(' + argument0 + ')\n';
};

Blockly.Java['text_length'] = function(block) {
  // String length.
  var argument0 = Blockly.Java.valueToCode(block, 'VALUE',
      Blockly.Java.ORDER_NONE) || '\'\'';
  return ['len(' + argument0 + ')', Blockly.Java.ORDER_FUNCTION_CALL];
};

Blockly.Java['text_isEmpty'] = function(block) {
  // Is the string null?
  var argument0 = Blockly.Java.valueToCode(block, 'VALUE',
      Blockly.Java.ORDER_NONE) || '\'\'';
  var code = 'not len(' + argument0 + ')';
  return [code, Blockly.Java.ORDER_LOGICAL_NOT];
};

Blockly.Java['text_indexOf'] = function(block) {
  // Search the text for a substring.
  // Should we allow for non-case sensitive???
  var operator = block.getFieldValue('END') == 'FIRST' ? 'find' : 'rfind';
  var argument0 = Blockly.Java.valueToCode(block, 'FIND',
      Blockly.Java.ORDER_NONE) || '\'\'';
  var argument1 = Blockly.Java.valueToCode(block, 'VALUE',
      Blockly.Java.ORDER_MEMBER) || '\'\'';
  var code = argument1 + '.' + operator + '(' + argument0 + ') + 1';
  return [code, Blockly.Java.ORDER_MEMBER];
};

Blockly.Java['text_charAt'] = function(block) {
  // Get letter at index.
  // Note: Until January 2013 this block did not have the WHERE input.
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var at = Blockly.Java.valueToCode(block, 'AT',
      Blockly.Java.ORDER_UNARY_SIGN) || '1';
  var text = Blockly.Java.valueToCode(block, 'VALUE',
      Blockly.Java.ORDER_MEMBER) || '\'\'';
  switch (where) {
    case 'FIRST':
      var code = text + '[0]';
      return [code, Blockly.Java.ORDER_MEMBER];
    case 'LAST':
      var code = text + '[-1]';
      return [code, Blockly.Java.ORDER_MEMBER];
    case 'FROM_START':
      // Blockly uses one-based indicies.
      if (Blockly.isNumber(at)) {
        // If the index is a naked number, decrement it right now.
        at = parseInt(at, 10) - 1;
      } else {
        // If the index is dynamic, decrement it in code.
        at = 'int(' + at + ' - 1)';
      }
      var code = text + '[' + at + ']';
      return [code, Blockly.Java.ORDER_MEMBER];
    case 'FROM_END':
      var code = text + '[-' + at + ']';
      return [code, Blockly.Java.ORDER_MEMBER];
    case 'RANDOM':
      Blockly.Java.definitions_['import_random'] = 'import random';
      var functionName = Blockly.Java.provideFunction_(
          'text_random_letter',
          ['def ' + Blockly.Java.FUNCTION_NAME_PLACEHOLDER_ + '(text):',
           '  x = int(random.random() * len(text))',
           '  return text[x];']);
      code = functionName + '(' + text + ')';
      return [code, Blockly.Java.ORDER_FUNCTION_CALL];
  }
  throw 'Unhandled option (text_charAt).';
};

Blockly.Java['text_getSubstring'] = function(block) {
  // Get substring.
  var text = Blockly.Java.valueToCode(block, 'STRING',
      Blockly.Java.ORDER_MEMBER) || '\'\'';
  var where1 = block.getFieldValue('WHERE1');
  var where2 = block.getFieldValue('WHERE2');
  var at1 = Blockly.Java.valueToCode(block, 'AT1',
      Blockly.Java.ORDER_ADDITIVE) || '1';
  var at2 = Blockly.Java.valueToCode(block, 'AT2',
      Blockly.Java.ORDER_ADDITIVE) || '1';
  if (where1 == 'FIRST' || (where1 == 'FROM_START' && at1 == '1')) {
    at1 = '';
  } else if (where1 == 'FROM_START') {
    // Blockly uses one-based indicies.
    if (Blockly.isNumber(at1)) {
      // If the index is a naked number, decrement it right now.
      at1 = parseInt(at1, 10) - 1;
    } else {
      // If the index is dynamic, decrement it in code.
      at1 = 'int(' + at1 + ' - 1)';
    }
  } else if (where1 == 'FROM_END') {
    if (Blockly.isNumber(at1)) {
      at1 = -parseInt(at1, 10);
    } else {
      at1 = '-int(' + at1 + ')';
    }
  }
  if (where2 == 'LAST' || (where2 == 'FROM_END' && at2 == '1')) {
    at2 = '';
  } else if (where1 == 'FROM_START') {
    if (Blockly.isNumber(at2)) {
      at2 = parseInt(at2, 10);
    } else {
      at2 = 'int(' + at2 + ')';
    }
  } else if (where1 == 'FROM_END') {
    if (Blockly.isNumber(at2)) {
      // If the index is a naked number, increment it right now.
      at2 = 1 - parseInt(at2, 10);
      if (at2 == 0) {
        at2 = '';
      }
    } else {
      // If the index is dynamic, increment it in code.
      // Add special case for -0.
      Blockly.Java.definitions_['import_sys'] = 'import sys';
      at2 = 'int(1 - ' + at2 + ') or sys.maxsize';
    }
  }
  var code = text + '[' + at1 + ' : ' + at2 + ']';
  return [code, Blockly.Java.ORDER_MEMBER];
};

Blockly.Java['text_changeCase'] = function(block) {
  // Change capitalization.
  var OPERATORS = {
    'UPPERCASE': '.upper()',
    'LOWERCASE': '.lower()',
    'TITLECASE': '.title()'
  };
  var operator = OPERATORS[block.getFieldValue('CASE')];
  var argument0 = Blockly.Java.valueToCode(block, 'TEXT',
      Blockly.Java.ORDER_MEMBER) || '\'\'';
  var code = argument0 + operator;
  return [code, Blockly.Java.ORDER_MEMBER];
};

Blockly.Java['text_trim'] = function(block) {
  // Trim spaces.
  var OPERATORS = {
    'LEFT': '.lstrip()',
    'RIGHT': '.rstrip()',
    'BOTH': '.strip()'
  };
  var operator = OPERATORS[block.getFieldValue('MODE')];
  var argument0 = Blockly.Java.valueToCode(block, 'TEXT',
      Blockly.Java.ORDER_MEMBER) || '\'\'';
  var code = argument0 + operator;
  return [code, Blockly.Java.ORDER_MEMBER];
};

Blockly.Java['text_print'] = function(block) {
  // Print statement.
  var argument0 = Blockly.Java.valueToCode(block, 'TEXT',
      Blockly.Java.ORDER_NONE) || '\'\'';
  return 'System.out.println(' + argument0 + '.toString());\n';
};

Blockly.Java['text_prompt'] = function(block) {
  // Prompt function (internal message).
  var functionName = Blockly.Java.provideFunction_(
      'text_prompt',
      ['def ' + Blockly.Java.FUNCTION_NAME_PLACEHOLDER_ + '(msg):',
       '  try:',
       '    return raw_input(msg)',
       '  except NameError:',
       '    return input(msg)']);
  var msg = Blockly.Java.quote_(block.getFieldValue('TEXT'));
  var code = functionName + '(' + msg + ')';
  var toNumber = block.getFieldValue('TYPE') == 'NUMBER';
  if (toNumber) {
    code = 'float(' + code + ')';
  }
  return [code, Blockly.Java.ORDER_FUNCTION_CALL];
};

Blockly.Java['text_prompt_ext'] = function(block) {
  // Prompt function (external message).
  var functionName = Blockly.Java.provideFunction_(
      'text_prompt',
      ['def ' + Blockly.Java.FUNCTION_NAME_PLACEHOLDER_ + '(msg):',
       '  try:',
       '    return raw_input(msg)',
       '  except NameError:',
       '    return input(msg)']);
  var msg = Blockly.Java.valueToCode(block, 'TEXT',
      Blockly.Java.ORDER_NONE) || '\'\'';
  var code = functionName + '(' + msg + ')';
  var toNumber = block.getFieldValue('TYPE') == 'NUMBER';
  if (toNumber) {
    code = 'float(' + code + ')';
  }
  return [code, Blockly.Java.ORDER_FUNCTION_CALL];
};


Blockly.Java['text_comment'] = function(block) {
  // Display comment
  
  var comment = block.getFieldValue('COMMENT') || '';
  var code = '/*\n' + comment + '\n*/\n';
  
  return code;
};


Blockly.Java['text_code_insert'] = function(block) {
  // Display code
  var type = block.getFieldValue('TYPE') || '';
  var code = '';
  if (type == 'Java')
  {
 	var comment = block.getFieldValue('CODE') || '';  	
 	code = '//Arbitrary Java code insert block';
  	if (comment != '')
  	{	
  		code += '\n';
  		code += comment +'\n';
  	}
  	else
  	{	
  		code += ' is empty\n';
	}
  }
  return code;
};