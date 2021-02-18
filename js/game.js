$(document).ready(function() {


    let currentQuestion = {
        ids: [],
        answers: [],
        answerIndex: -1
    };

    let correctAnswer = 0;
    let incorrectAnswer = 0;
    let noAnsAnswer = 0;


    // Game  object.
    let game = {
        questionsAsked: 0,
        // API things
        queryMethod: 'GET',
        queryURL: 'http://pokeapi.co/api/v2/pokemon/',

        selectQuestion: function() {

            if (game.questionsAsked === 1) {
                DOMFunctions.callDOMFunctions('gameComplete');
            } else {
                currentQuestion.answers = [];
                currentQuestion.ids = [];
                game.questionsAsked++;
                let idArray = [];
                while (idArray.length < 4) {
                    let pokeID = Math.ceil(Math.random() * 721);
                    if (idArray.indexOf(pokeID) !== -1) continue;
                    idArray.push(pokeID);
                }

                currentQuestion.answerIndex = Math.floor(Math.random() * 4);

                idArray.forEach(function(element) {
                    // Query Pokeapi
                    $.ajax(url = game.queryURL + element + '/', method = game.queryMethod)
                        .done(function(response) {
                            currentQuestion.answers.push(response.species.name);
                            currentQuestion.ids.push(response.id);
                            game.startQuestion();
                        });
                });
            }
        },

        startQuestion: function() {
            if (currentQuestion.ids.length === 4) {
                DOMFunctions.callDOMFunctions(event = 'newQuestion');
                timer.start();
            }
        },

        isCorrect: function(answer) {
            if (answer === currentQuestion.answers[currentQuestion.answerIndex]) {
                return true;
            } else {
                return false;
            }
        },

        updateScores: function(correct) {
            if (correct === true) {
                correctAnswer++;
            } else if (correct === false) {
                incorrectAnswer++;
            } else {
                noAnsAnswer++;
            }
        },

        resetGame: function() {
            game.questionsAsked = 0;
            correctAnswer = 0;
            incorrectAnswer = 0;
            noAnsAnswer = 0;
        }
    };


    // DOM functions
    let DOMFunctions = {
        ShowTimer: function() {
            $('.timer').css('display', 'block');
        },
        ShowTimeLeft: function(timeRemaining) {
            $('#timer').text(timeRemaining);
        },
        ShowGIF: function() {
            $('.start').hide();
            $('.timer').css('display', 'block');
            $('.loading-image').css('display', 'block');
        },
        ShowQuestion: function() {
            $('.loading-image').hide();
            $('.reset').css('display', 'block');
            $('.showPokeImg').show();
            $('.displayOptions').show();
            $('.answer-options').empty();
            $('.pokeImg').addClass('silhouette');
            $('.pokeImg').attr('src', 'image/pokemonImg/' + currentQuestion.ids[currentQuestion.answerIndex] + '.png');
            $('.pokeImg').attr('alt', 'A mystery Pokemon\'s silhouette');

            for (let i = 0; i < currentQuestion.answers.length; i++) {
                option = $('<p>');
                option.text(currentQuestion.answers[i]);
                option.addClass('text-center option');
                option.attr('role', 'button');
                option.attr('data-name', currentQuestion.answers[i]);
                $('.answer-options').append(option);
            }
        },
        ShowAnswer: function(correct) {
            $('.timer').hide();
            $('.displayOptions').hide();
            $('.result').show();
            $('#correct-answer').text('It\'s ' + currentQuestion.answers[currentQuestion.answerIndex] + '!');
            $('.pokeImg').toggleClass('silhouette');
            $('.pokeImg').attr('alt', 'An image of ' + currentQuestion.answers[currentQuestion.answerIndex]);
            if (correct === true) {
                $('#right-or-wrong').text('Correct!');
            } else if (correct === false) {
                $('#right-or-wrong').text('Incorrect...');
            } else {
                $('#right-or-wrong').text('Time\'s Up!');
            }
            setTimeout(game.selectQuestion, 1700);
        },
        hideAnswer: function() {
            $('.timer').show();
            $('.result').hide();
        },
        ShowResults: function() {
            $('.showPokeImg').hide();
            $('.timer').hide();
            $('.finalResultBox').show();
            $('.restart').show();
            $('#correctAns').text('Correct: ' + correctAnswer);
            $('#wrongAns').text('Incorrect: ' + incorrectAnswer);
            $('#noAns').text('Unanswered: ' + noAnsAnswer);
            $('.reset').hide();
        },
        ShowNewGame: function() {
            $('.restart').hide();
            $('.timer').hide();
            $('.finalResultBox').hide();
            $('#timer').text('');
            $('.start').show();
            $('.pokeImg').addClass('silhouette');
            $('.reset').hide();
        },


        callDOMFunctions: function(event, correct, timeRemaining) {
            if (event === 'startGame') {
                DOMFunctions.ShowGIF();
            } else if (event === 'newQuestion') {
                DOMFunctions.hideAnswer();
                DOMFunctions.ShowQuestion();
                DOMFunctions.ShowTimer();
            } else if (event === 'countDown') {
                DOMFunctions.ShowTimeLeft(timeRemaining);
            } else if (event === 'questionAnswered') {
                DOMFunctions.ShowAnswer(correct);
            } else if (event === 'gameComplete') {
                DOMFunctions.hideAnswer();
                DOMFunctions.ShowResults();
            } else if (event === 'restartClicked') {
                DOMFunctions.ShowNewGame();
            }
        }
    };

    let timer = {

        count: 11,

        start: function() {
            timer.decrement();
            counter = setInterval(timer.decrement, 1000);
        },

        decrement: function() {
            timer.count--;
            DOMFunctions.callDOMFunctions(event = 'countDown', correct = null, timeRemaining = timer.count);
            if (timer.count === 0) {
                timer.stop();
                game.updateScores();
                DOMFunctions.callDOMFunctions(event = 'questionAnswered', correct = '');
            }
        },

        stop: function() {
            clearInterval(counter);
            timer.count = 11;
        },
    };

    // event listeners
    // start btn click on
    $('#startBtn').on('click', function() {
        game.selectQuestion();
        DOMFunctions.callDOMFunctions(event = 'startGame');
    });

    // ans is click on.
    $(document).on('click', '.option', function() {
        let answerText = $(this).data('name');
        // Check if the answer is correct.
        let answerIsCorrect = game.isCorrect(answerText);
        timer.stop();
        game.updateScores(answerIsCorrect);
        DOMFunctions.callDOMFunctions(event = 'questionAnswered', correct = answerIsCorrect);
    });

    // restart button click on.
    $('#restartBtn').on('click', function() {
        game.resetGame();
        DOMFunctions.callDOMFunctions(event = 'restartClicked');
    });

    // reset button click on
    $('#resetBtn').on('click', function() {
        game.resetGame();
        DOMFunctions.callDOMFunctions(event = 'restartClicked');
        $('.showPokeImg').hide();
        $('.displayOptions').hide();
        timer.stop();
    })
});
