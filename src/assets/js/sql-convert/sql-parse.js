/**
 * @Description:
 * @author zzh
 * @createTime 2020/4/12
 */
function clickMe(index) {
    return index + "  return "
}

/**
 * 检测括号，返回匹配括号的索引
 * @param {Character Arrays} items 
 * @returns {Map<any, any>}
 */
function checkBracketPairs(items) {



    // 开始括号栈 => FILO 先入后出(push => 入, pop => 尾出)
    const leftStack = [];//存储左括号的栈
    const leftStackIndex = [];//存储左括号记录
    // 结束括号队列 => FIFO 先入先出(push => 入, shift => 顶出)
    const rightQueue = [];
    const rightQueueIndex = [];

    // 开始括号栈指针 flag
    let leftPointer = 0;
    // 结束括号栈指针 flag
    let rightPointer = 0;

    let i = 0;
    const last = items.length;
    const graphMap = new Map();

    if (items.length) {
        do {
            leftPointer = leftStack.length;
            rightPointer = rightQueue.length;

            const condition = items[i++];

            // leftBracket
            // if (condition.leftBracket) {
            if (condition === '(') {
                // 入栈并记录标志位
                leftPointer = leftStack.push(condition);
                leftStackIndex.push(i);
            }

            // rightBracket
            // if (condition.rightBracket) {
            if (condition === ')') {
                // 入栈并记录标志位
                rightPointer = rightQueue.push(condition);
                rightQueueIndex.push(i);

                if (leftPointer) {
                    // 左括号出栈，对应最新的 第一个右括号
                    const l = leftStack.pop();
                    const lIndex = leftStackIndex.pop();

                    // 右括号出列，对应其匹配的左括号
                    const r = rightQueue.shift();
                    const rIndex = rightQueueIndex.shift();

                    if (l && r) {
                        // 用图记录其位置 { lIndex: rIndex }
                        graphMap.set(lIndex, rIndex);
                    }
                } else {
                    // 无左括号 => Error
                    throw Error('sql非法，无法找到匹配的左括号');
                }
            }

            // 依然存在右括号，而没有左括号
            if (!leftPointer && rightPointer) {
                throw Error('sql非法，无法找到匹配的左括号');
            }

            // 依然存在左括号，而没有右括号
            if (leftPointer > rightPointer && i === last) {
                throw Error('sql非法，无法找到匹配的右括号');
            }
        } while (i < last)
    }
    return graphMap;

}


function sqlCaculator(sqllll) {
    let operandStack = [];
    // 操作符栈 FILO
    let operatorStack = [];

    let operators = {
        '=': '==',
        '!=': '!=',
        '>': '>',
        '>=': '>=',
        '<': '<',
        '<=': '<=',
        'not': '!',
        'in': 'in',//not in 也在此处判断
        'is': 'get',
        //单目运算符,检查否定语义,单一个not
        'not in': '!in',
        // 'and': '',
        // 'or': '',
        'is null': 'get',//类似单目运算符
        'is not null': 'get'//获取要素属性的运算符,is null
        // 'like': '',
        // '%': '',
        // 'not': 'none',
    };


    /**
     * 定义数组删除所有指定元素
     * @param val
     */
    // Array.prototype.remove = function (val) {
    //     let index = this.indexOf(val);
    //
    //     while (index > -1) {
    //         this.splice(index, 1);
    //         index = this.indexOf(val);
    //     }
    // };
    /**
     * 把字符串拆分成数组
     * @param sqlStr
     * @returns {*|string[]}
     */
    let sqlStrSplit = (sqlStr) => {
        return sqlStr.split(' ');
    };

    /**
     * 获取string里character出现的所有的位置
     * @param string
     * @param character
     * @returns {[]}
     */
    let getcharacterPositions = (string, character) => {

        const bracketPositions = [];
        let pos = string.indexOf(character);
        while (pos > -1) {
            bracketPositions.push(pos);
            pos = string.indexOf(character, pos + 1);
        }
        return bracketPositions;
    };


    let matchOperators = (sqlArrs) => {
        // let hasOperator = false;
        // let operator = '';
        // let operatorIndex;
        // 返回的表达式
        let exp = [];
        if (sqlArrs.length != 1) {
            exp.push('all');
        }

        sqlArrs.forEach((sqlArr) => {
            let hasOperator = false;
            let operator = '';
            let operatorIndex;

            //
            Object.keys(operators).forEach((value) => {
                // sqlArr 中间不存在括号，空格等特殊字符，sqlArr是一个个的单词
                // value是in\not\is和其他比较运算符
                // 检索成功后直接返回不在检索
                if (hasOperator) {
                    return true
                }
                operatorIndex = sqlArr.indexOf(value);
                // 存在操作符
                if (operatorIndex != -1) {
                    // **********特殊操作符处理**********
                    // 是not,先做关于not的运算
                    if (value === 'not') {
                        // operator = value;
                        // hasOperator = true;
                        // 是 not in
                        if (sqlArr[operatorIndex + 1] === 'in') {
                            operator = 'not in';
                            hasOperator = true;
                        }
                        // 是 is not null,先检索的is，此处顺序有误不能成立
                        else if (sqlArr[operatorIndex - 1] === 'is' && sqlArr[operatorIndex + 1] === 'null') {
                            operator = 'is not null';
                            hasOperator = true;
                        }
                        // 仅有not , 单目运算符
                        else {
                            operator = 'not';
                            hasOperator = true;
                        }
                    }
                    else if (value === 'is') {
                        if (sqlArr[operatorIndex + 1] === 'null') {
                            operator = 'is null';
                            hasOperator = true;
                        } else if (sqlArr[operatorIndex + 1] === 'not' && sqlArr[operatorIndex + 2] === 'null') {
                            operator = 'is not null';
                            hasOperator = true;
                        }
                    }
                    // 一般情况
                    else {
                        operator = value;
                        hasOperator = true;
                    }
                }


            });
            // 有操作符，不是替换过来的
            if (hasOperator) {

                // ******特殊操作符处理*************
                if (operator === 'not') {

                    //todo operator == 'not' 的匹配
                    let exp1 = [operators[operator]].concat(sqlArr[1]);
                    // exp.push(exp1);
                    if (exp.length) {
                        exp.push(exp1);
                    }
                    else
                        exp = exp1;

                }
                // 单目运算符 not 基本上是与in进行匹配
                else if (operator === 'not in') {

                    //todo operator == 'not in' 的匹配
                    let exp1 = [operators[operator]].concat(sqlArr[0]).concat(sqlArr[3]);
                    if (exp.length) {
                        exp.push(exp1);
                    }
                    else
                        exp = exp1;

                }
                // 运算符 is null
                else if (operator === 'is null') {
                    let exp1 = ['=='];
                    let arr2 = ['get', sqlArr[0]];
                    exp1.push(arr2);
                    exp1.push('null');

                    if (exp.length) {
                        exp.push(exp1);
                    }
                    else
                        exp = exp1;
                    // exp.push(exp1);
                }
                else if (operator === 'is not null') {
                    let exp1 = ['!='];
                    let arr2 = ['get', sqlArr[0]];
                    exp1.push(arr2);
                    exp1.push('null');
                    // exp.push(exp1);
                    if (exp.length) {
                        exp.push(exp1);
                    }
                    else
                        exp = exp1;
                }
                // 不是in 和 not
                else {
                    // 是否为字符类型
                    let exp1;
                    if (sqlArr[2].indexOf('\'') !== -1)
                        exp1 = [operators[operator]].concat(sqlArr[0]).concat(sqlArr[2].replace(/'/g, ''));
                    else
                        //能转换字符的再转
                        if (Number(sqlArr[2]))
                            exp1 = [operators[operator]].concat(sqlArr[0]).concat(Number(sqlArr[2]));
                        else
                            exp1 = [operators[operator]].concat(sqlArr[0]).concat(sqlArr[2]);
                    // exp.push(exp1);
                    if (exp.length) {
                        exp.push(exp1);
                    }
                    else
                        exp = exp1;
                }
            }
            // 没有操作符，是替换过来的或者是属性列表
            else {
                // 存在“,”，是属性列表
                if (sqlArr[0].indexOf(',') != -1) {
                    exp = exp.concat(sqlArr[0].replace(/'/g, '').split(','));
                    if (Number(exp[0]))
                        exp.map(Number);
                    else
                        exp.map(String);
                }
                else {
                    if (exp.length) {
                        exp.push(sqlArr);
                    }
                    else
                        exp = sqlArr;
                    // exp.push(sqlArr);
                }

            }
        });
        return exp;

    };


    /**
     *  //输入不含空格的纯字符数组
     * @param array
     * @param Character
     * @returns {[]}
     * @constructor
     */
    let ExtractArrByCharacter = (array, Character) => {

        let arrays = [];
        let string = array.join(' ');
        let arrayCopy = string.split(Character);
        arrayCopy.forEach((value) => {
            let tem = value.split(' ');
            tem.remove('');
            arrays.push(tem);

        });
        return arrays;

    };

    // sql里只有and的情况，进行这一步时已经检查过or
    let matchAndExp = (sqlArr) => {
        let andArr = getcharacterPositions(sqlArr, 'and');
        // 没有and
        let sqlArrs = [];
        if (andArr.length === 0) {
            return [sqlArr];
        }
        // 有and
        else {
            sqlArrs = ExtractArrByCharacter(sqlArr, 'and');
            return sqlArrs;
        }


    };

    /**
     * 匹配or运算符
     * @param sqlArr
     * @returns {*[]}
     */
    let matchOrExp = (sqlArr) => {
        let orArr = getcharacterPositions(sqlArr, 'or');
        // 没有or
        let sqlArrs = [];
        if (orArr.length === 0) {
            return [sqlArr];
        }
        // 有or
        else {
            sqlArrs = ExtractArrByCharacter(sqlArr, 'or');
            return sqlArrs;
        }

    };




    let caculate = (sqlArr) => {
        // OR优先级最低，把or的位置找出来，先找or 再找and 然后找操作符
        // console.log(sqlArr.toString());
        let sqlOrArr = matchOrExp(sqlArr);
        let result = [];
        // 没有 or
        if (sqlOrArr.length === 1) {
            let sqlAndArr = matchAndExp(sqlOrArr[0]);
            result = matchOperators(sqlAndArr);

        } else {
            result = ['any'];
            sqlOrArr.forEach((value) => {
                let andArr = matchAndExp(value);
                result.push(matchOperators(andArr));
            });
        }
        // matchAndExp(sqlArr).forEach((value) => {
        //     let sqlArrs = matchAndExp(sqlArr)
        //
        // });


        return result;

    };


    // 没有接收到结果
    return caculate(sqllll);


}


function getSqlArr(sqllll) {

    /**
     * 定义数组删除所有指定元素
     * @param val
     */
    // Array.prototype.remove = function (val) {
    //     let index = this.indexOf(val);
    //
    //     while (index > -1) {
    //         this.splice(index, 1);
    //         index = this.indexOf(val);
    //     }
    // };
    /**
     * 把字符串拆分成数组
     * @param sqlStr
     * @returns {*|string[]}
     */
    let sqlStrSplit = (sqlStr) => {
        return sqlStr.split(' ');
    };

    /**
     * 获取string里character出现的所有的位置
     * @param string
     * @param character
     * @returns {[]}
     */
    let getcharacterPositions = (string, character) => {

        const bracketPositions = [];
        let pos = string.indexOf(character);
        while (pos > -1) {
            bracketPositions.push(pos);
            pos = string.indexOf(character, pos + 1);
        }
        return bracketPositions;
    };

    let getSqlArr1 = (sqlStr) => {
        sqlStr = sqlStr || "";
        const reg = RegExp(/\(|\)/);
        let sqlArr = sqlStrSplit(sqlStr);
        let sqlArrCopy = [].concat(sqlArr);


        sqlArrCopy.forEach((value, index) => {
            // 检测存在有'(' or ')'的item再次分割替代原有数组项
            if (value.length > 1 && reg.exec(value)) {
                // 得到两个字符的位置并排序
                const bracketPositions = getcharacterPositions(value, '(').concat(getcharacterPositions(value, ')')).sort((a, b) => {
                    return a - b;
                });
                // 临时存储value中在分割提取括号的项
                const data1 = [];
                // 根据bracketPositions对value进行分割 0,0-1,1,1-2,2
                for (let i = 0; i < bracketPositions.length; i++) {

                    // extract index 0
                    data1.push(value.substr(bracketPositions[i], 1));
                    // extract index 0-1
                    if (i + 1 < bracketPositions.length) {
                        data1.push(value.substring(bracketPositions[i] + 1, bracketPositions[i + 1]));
                    }
                }
                // console.log(data1);
                // 将data1 插入原有数组并替换掉原有项
                let indexSQLArr = sqlArr.indexOf(value);
                data1.forEach((value1, index1) => {
                    // 获取位置
                    // 第一次需要删除原有元素
                    if (index1 === 0) {

                        sqlArr.splice(indexSQLArr, 1, value1);
                    } else {
                        sqlArr.splice(indexSQLArr + index1, 0, value1);
                    }
                });
                // sqlArr.splice(index, 1, data1.toString());
                // console.log(value);

            }
        });

        // 移除array所有相同的字符
        Array.prototype.remove = function (val) {
            var index = this.indexOf(val);
            while (index > -1) {
                this.splice(index, 1);
                index = this.indexOf(val);
            }
        };
        sqlArr.remove('');
        sqlArr.remove('(');
        sqlArr.remove(')');
        return sqlArr;
    };

    return getSqlArr1(sqllll)

}
/**
* 把所有的操作符和操作数分开存储在Array对象里，清除括号和空格，供使用数据栈进行逻辑运算使用
* @param sqlStr
* @returns {*|string[]}
*/


function sqlParse(sqllll) {
    let sql = '';

    // let checkBracketPairs = require('./checkBracketPairs');
    // let sqlCaculate = require('./sqlCaculator');
    // 倒叙层级root tree
    /**
     * 倒叙层级root tree
     * @type {*[]}
     */
    let reverseTree = [];

    // 树索引
    /**
     * 树索引
     * @type {*[]}
     */
    let bracketTreeNodes = [];
    // 存储需要进行替换的sql的id
    let replacedBracketTreeNodesId = [];

    // 构建括号索引树
    /**
     * 构建括号索引树
     * @param arr
     * @param parent
     * @returns {{childrenId: [], index: *, id: string, value: string, parentId: string}}
     */
    let contructTree = (arr, parent, level) => {
        return {
            id: arr.join('-'),
            index: arr,
            value: '',
            treeValue: '',
            mapBoxExpression: [],
            level: level, //从1开始，根节点是1
            childrenId: [],
            parentId: parent.join('-')

        };
    };

    // 寻找根节点
    /**
     * 寻找根节点,
     * @param Trees
     * @returns {[]}
     */
    let searchRootTree = (Trees) => {

        let rootTrees = [];
        Trees.forEach((value) => {
            let flag = 0;

            // 判断value和其他项的关系，是否存在嵌套、并列等
            Trees.forEach((value1) => {
                // 相等关系
                if (value === value1) {
                    return false;
                }
                // value被value1包含，有括号的嵌套关系
                else if (value[0] > value1[0] && value[1] < value1[1]) {
                    return false;
                }
                // 无嵌套，不被包含，至少是并列关系或是根节点
                else
                    flag += 1;
            });

            // 无嵌套，全是并列括号
            console.log("Trees.length:", Trees.length);
            if (flag === Trees.length - 1) {
                rootTrees.push(value);
            }
        });

        // 删除Trees里已经匹配的根节点
        rootTrees.forEach((value) => {
            let index = Trees.indexOf(value);
            if (index > -1) {
                Trees.splice(index, 1);
            }
        });

        // console.log("rootTrees", rootTrees);

        // 匹配完成，返回
        if (Trees.length === 0) {
            return rootTrees;
        }

        // 递归匹配
        reverseTree.push(searchRootTree(Trees));

        return rootTrees;

    };

    /**
     * 寻找父节点
     * @param reverseTree
     * @param bracketTreeNodes
     */
    let searchParent = (reverseTree, bracketTreeNodes) => {
        for (let i = 0; i < reverseTree.length; i++) {
            if (reverseTree[i + 1]) {
                reverseTree[i].forEach((value) => {
                    // 父亲节点存储在t[i+1]
                    reverseTree[i + 1].forEach((value1) => {
                        // value1是value的父亲
                        if (value1[0] < value[0] && value1[1] > value[1]) {
                            bracketTreeNodes.push(contructTree(value, value1, reverseTree.length - i));
                        }
                    });
                });
            } else {
                // 根节点
                reverseTree[i].forEach((value) => {
                    bracketTreeNodes.push(contructTree(value, [0, 0], reverseTree.length - i));
                });
            }
        }

    };

    /**
     * 需寻找孩子
     * @param reverseTree
     * @param bracketTreeNodes
     */
    let searchChildren = (reverseTree, bracketTreeNodes) => {
        bracketTreeNodes.forEach((node) => {
            // 第几级就在第几级里面找
            if (node.level < reverseTree.length) {
                reverseTree[Number(node.level) - 1].forEach((item) => {
                    // 如果是node的孩子就加入
                    if (node.index[0] < item[0] && node.index[1] > item[1])
                        node.childrenId.push(item.join('-'));
                });
            }
        });
    };

    // 给节点赋值
    /**
     * 给节点赋值
     * @param treeNode
     */
    let setTreeValue = (treeNode) => {
        var tem = sql.substring(treeNode.index[0], treeNode.index[1] - 1);
        treeNode.treeValue = tem;

        if (treeNode.childrenId.length !== 0) {
            treeNode.childrenId.forEach((child) => {
                let childIndex = child.split('-');
                let tempChild = sql.substring(childIndex[0], childIndex[1] - 1);
                // tem.replace(tempChild, treeNode.id);
                tem = tem.replace('(' + tempChild + ')', child);
            });
            treeNode.value = tem;
            return;
        }
        treeNode.value = tem;
    };

    // 匹配根节点进行切分
    /**
     * 匹配根节点进行切分
     * @param bracketTreeNodes
     * @param originSQL
     * @returns {*}
     */
    let assembleSQL = (bracketTreeNodes, originSQL) => {

        // 把root0的括号替换
        bracketTreeNodes.forEach((node) => {
            // 根节点
            if (node.level === 1) {
                originSQL = originSQL.replace(node.treeValue, node.id);
                // 替换的id存储起来
                replacedBracketTreeNodesId.push(node.id);
            }
        });
        return originSQL;

    };

    /**
     * 获取替换节点的索引位置，//todo 对于不正确添加括号的行为还有待加强
     * @param ReplaceNodeId
     * @param exp
     * @returns {[number, number, number]|boolean|[number, number]}
     */
    let getReplaceNodeIndex = (ReplaceNodeId, exp) => {
        // 三维
        if (exp[0] === 'any') {
            for (let x = 0; x < exp.length; x++) {
                for (let y = 0; y < exp[x].length; y++) {
                    for (let z = 0; z < exp[y].length; z++) {
                        if (exp[x][y][z] === ReplaceNodeId) {
                            return [x, y, z];
                        }
                    }
                }
            }
        } else if (exp[0] === 'all') {
            for (let x = 0; x < exp.length; x++) {
                for (let y = 0; y < exp[x].length; y++) {
                    if (exp[x][y] === ReplaceNodeId) {
                        return [x, y];
                    }
                }
            }
        } else//todo 这里需要对简单句的in语句做一个处理，简单句的替换
            for (let x = 0; x < exp.length; x++) {
                if (exp[x] === ReplaceNodeId) {
                    return [x];
                }
            }
    };

    let getReplaceNodeIndexR = (ReplaceNodeId, exp) => {
        for (let x = 0; x < exp.length; x++) {
            if (exp[x] === ReplaceNodeId) {
                return [x];
            }
            for (let y = 0; y < exp[x].length; y++) {
                if (exp[x][y] === ReplaceNodeId) {
                    return [x, y];
                }
                for (let z = 0; z < exp[x][y].length; z++) {
                    if (exp[x][y][z] === ReplaceNodeId) {
                        return [x, y, z];
                    }
                }

            }
        }

    };
    // 遍历树
    let traverseTree = (nodeTrees) => {
        // var exp = [];
        // 树的层数
        var levels = [];
        nodeTrees.forEach((node) => {
            levels.push(Number(node.level));
        });

        // 去重
        levels = [...new Set(levels)];

        //按层遍历， value
        for (let i = levels.length - 1; i > 0; i--) {
            // 找到level=i的节点，将自己的exp存到自己的父节点中，并改写父节点中exp的值
            nodeTrees.filter((node) => node.level === i).forEach((node) => {
                // 获取自身在父节点exp中的位置
                // node.value是当前节点的exp

                // 找到当前节点的父亲item,每一个节点应该有且只有一个父节点
                // nodeTrees.filter((item) => item.id === node.parentId)[0].value;//父节点的exp
                // index是node的exp在其父节点item的exp中的位置，可能是一维、二维、三维
                let parentExp = nodeTrees.filter((item) => item.id === node.parentId)[0].mapBoxExpression;
                let index = getReplaceNodeIndexR(node.id, parentExp);
                if (index) {
                    let x = index[0];
                    let y = index[1];
                    let z = index[2];
                    // 三维的，带有any
                    if (index.length === 3) {
                        if (parentExp[x][y].length === 1) {
                            parentExp[x][y] = node.mapBoxExpression;
                        } else {
                            parentExp[x][y][z] = node.mapBoxExpression;
                        }
                        return true;
                    }
                    // 二维的，带and
                    else if (index.length === 2) {
                        if (parentExp[x].length === 1) {
                            parentExp[x] = node.mapBoxExpression;
                        } else {
                            parentExp[x][y] = node.mapBoxExpression;
                        }
                        return true;
                    }
                    // 以为的，单语句，不含逻辑运算符
                    else if (index.length === 1) {
                        parentExp.splice(x, 1, node.mapBoxExpression)
                    }

                }// 当前层级遍历结束


                nodeTrees.filter((item) => item.id === node.parentId)[0].mapBoxExpression = parentExp;
            });

            // 所有层级遍历结束
        }

        return nodeTrees;
    };

    let replaceNode = (exp) => {
        while (replacedBracketTreeNodesId.length != 0) {
            let indexInsert = [];

            replacedBracketTreeNodesId.forEach((value) => {
                let indexR = getReplaceNodeIndex(value, exp);//获取替换参数value在exp中的索引位置
                if (indexR) {
                    let tem = {
                        id: value,
                        index: indexR,
                        sql: bracketTreeNodes.filter(value1 => value1.id === value)[0].value
                    };
                    indexInsert.push(tem);
                }
                // 移除指定值
                replacedBracketTreeNodesId.remove(value);
            });


            // 递归替换所有的子项，截止条件是最后一项没有孩子
            indexInsert.forEach((item) => {//判断是表达式或者是属性列表
                let expression = sqlCaculator(getSqlArr(item.sql));

                let operators = {
                    '=': '==',
                    '!=': '!=',
                    '>': '>',
                    '>=': '>=',
                    '<': '<',
                    '<=': '<=',
                    'not': '!',
                    'in': 'in',//not in 也在此处判断
                    'is': 'get',
                    //单目运算符,检查否定语义,单一个not
                    'not in': '!in',
                    // 'and': '',
                    // 'or': '',
                    'is null': 'get',//类似单目运算符
                    'is not null': 'get'//获取要素属性的运算符,is null
                    // 'like': '',
                    // '%': '',
                    // 'not': 'none',
                };

                let CONSTANT = false;
                let flag = 0;
                Object.keys(operators).forEach((operator) => {
                    // let flag = item.sql.indexOf(operator);
                    // 是属性列表
                    if (item.sql.indexOf(operator) === -1) {
                        flag += 1;
                    }
                });

                if (flag === 10) {
                    CONSTANT = true;
                }

                if (!getReplaceNodeIndex(item.id, expression)) {
                    let x = item.index[0];
                    let y = item.index[1];
                    let z = item.index[2];
                    if (item.index.length === 3) {
                        // if (CONSTANT) {
                        //     exp[x][y].concat(expression)
                        // } else {
                        //     exp[x][y][z] = expression;
                        // }

                        // console.log(" exp[x][y][z]", exp[x][y][z]);
                        if (exp[x][y].length === 1) {
                            exp[x][y] = expression;
                        } else {
                            exp[x][y][z] = expression;
                        }
                        // exp[x][y][z] = expression;
                        return true;
                    } else if (item.index.length === 2) {
                        // if (CONSTANT) {
                        //     exp[x].concat(expression)
                        // }else {
                        //     exp[x][y] = expression;
                        // }
                        // exp[x][y] = expression;
                        // todo 内嵌any的[]问题
                        // 如果上一节也只有一个表达式，即当前语句是一个组合句
                        if (exp[x].length === 1) {
                            exp[x] = expression;
                        } else {
                            exp[x][y] = expression;
                        }

                        return true;
                    } else if (item.index.length === 1) {
                        //todo 替换问题
                        //  exp.pop();
                        //  exp.push(expression);
                        exp.splice(x, 1, expression)
                    }
                } else {
                    replaceNode(expression);//继续递归替换
                }
            });
        }
    };

    let getRootNode = (sqlStr) => {
        // 把root0的括号替换
        let rootTree = contructTree([0, 0], ['s', 's'], 0);
        // 替换前的SQL赋值给根节点
        rootTree.treeValue = sqlStr;
        bracketTreeNodes.forEach((node) => {
            // 根节点
            if (node.level === 1) {
                sqlStr = sqlStr.replace(node.treeValue, node.id);
                // 替换的id存储起来
                rootTree.childrenId.push(node.id);
            }
        });
        // 替换后的值赋值给根节点
        rootTree.value = sqlStr;
        bracketTreeNodes.push(rootTree);
    };

    let startParse = (sqlStr) => {

        sql = sqlStr;
        // 将解析出的括号的索引的map结构转化为数组，存储在bracketIndexArr,每一项元素代表一个括号里的表达式
        let bracketIndexArr = [];
        let sqlMap = checkBracketPairs(sqlStr);
        sqlMap.forEach((value, key, map) => {
            bracketIndexArr.push([key, value])
        });

        // 寻找每一层级的根节点
        reverseTree.push(searchRootTree(bracketIndexArr));

        // 寻找每个节点的孩子和父亲
        searchParent(reverseTree, bracketTreeNodes);
        searchChildren(reverseTree, bracketTreeNodes);


        // console.log(bracketTreeNodes);
        // 给每个节点赋值
        bracketTreeNodes.forEach((node) => {
            setTreeValue(node);//给node节点赋值
            // node.mapBoxExpression=sqlCaculate.caculate(sqlCaculate.getSqlArr(node.value))
        });

        // 根节点组织起来
        getRootNode(sqlStr);

        // 给每个节点作语义转换
        bracketTreeNodes.forEach((node) => {
            // setTreeValue(node);//给node节点赋值
            let arr1 = getSqlArr(node.value);
            node.mapBoxExpression = sqlCaculator(arr1)
        });
        //树已经构建完成
        // 开始匹配

        bracketTreeNodes = traverseTree(bracketTreeNodes);

        let mapbox_gl_expression = bracketTreeNodes.filter((node) => node.id === '0-0')[0].mapBoxExpression;

        return mapbox_gl_expression;
    };


    return startParse(sqllll)
}

function convert(sqlStr) {
    return sqlParse(sqlStr)
    // return clickMe(index)
}
// var testStr1 = "fname = '商超'";
// var testStr2 = "fname != '商超'";
// var testStr3 = "flevel > 10";
// var testStr4 = "fcode is  null";
// var testStr5 = "fcode is not null";
// var testStr6 = "fcode in ('3303','3304')";
// var testStr7 = "fcode not in (3303,3304)";
// var testStr8 = "not (fscale == 20)";
// var testStr9 = "not (fname is null )";
// var testStr10 = "flevel < 10  or ftype = 'cityriver'";
// var testStr11 = "(fscale <= 20) and ((flevel < 10) or ftype = 'cityriver')";
// var testStr12 = "(fscale <= 20 and (flevel < 10 or ftype = 'cityriver')) and fcode in ('3303','3304')";
// var testStr13 = "fscale <= 20 and (flevel < 10 or ftype = 'cityriver')";
// var testStr14 = "fscale  <= 20 and  not  ( fname  is  null )  and ( fname   in  ('七星岛','海礁') or   fcode  in  ('2702011204','2702012204','702013204'))";
// var testStr15 = "not  ( fname  is  null ) and  fcode = '7512020106'";
// let res=convert(testStr12);
// console.log(res);

export {
    convert
}
