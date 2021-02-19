// modified from https://github.com/mchlltt/Guess-That-Pokemon
$(document).ready(function() {


    let currentQuestion = {
        ids: [],
        answers: [],
        artwork: [],
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

            if (game.questionsAsked === 5) {
                DOMFunctions.callDOMFunctions('gameComplete');
            } 
            else {
                currentQuestion.answers = [];
                currentQuestion.ids = [];
                currentQuestion.artwork = [];
                game.questionsAsked++;
                let idArray = [];
                while (idArray.length < 4) {
                    let pokeID = Math.ceil(Math.random() * 1118);
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
                            currentQuestion.artwork.push(response['sprites']['other']['official-artwork']['front_default'])
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
            $('.pokeImg').attr('src',currentQuestion.artwork[currentQuestion.answerIndex])
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
            $('.pokemon-info').show();
            $('#wiki-link').attr('href','https://bulbapedia.bulbagarden.net/wiki/'+currentQuestion.answers[currentQuestion.answerIndex]+'_(Pok%C3%A9mon)')
            setTimeout(game.selectQuestion, 1500);
        },
        hideAnswer: function() {
            $('.timer').show();
            $('.result').hide();
            $('.pokemon-info').hide();
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

        //calling of functions based on state of game
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
        // timer will start at 10
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
        // stops timer from counting down and reset back to 10 sec
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




