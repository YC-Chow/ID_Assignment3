$(document).ready(function() {

    // current question object
    let currentQuesiton = {
        ids: [],
        answer: [],
        answerIndex: -1,
    };

    // current scores variables
    let correctAnswer = 0;
    let wrongAnswer = 0;
    let noAnsAnswer = 0;

    //Game object
    let game = {
        questionsAsked = 0,

        //API
        queryMethod: 'GET',
        queryURL: 'http://pokeapi.co/api/v2/pokemon/',
        
        //Game methods
        selectQuestion: function(){
            if (this.questionsAsked === 10){
                console.log('NO FUNCTION YET');
            }
            else{
                currentQuesiton.answer = [];
                CurrentQuestion.ids = [];
                this.questionsAsked++

                let idArray = [];
                while (idArray.length < 4) {
                    let pokeID = Math.ceil(Math.random() * 721);
                    if (idArray.indexOf(pokeID) !== -1) continue;
                    idArray.push(pokeID);
                }
                // randomly selects 1 of 4 option as answer
                currentQuestion.answerIndex = Math.floor(Math.random() * 4);

                idArray.forEach(function(element) {
                    // Query Pokeapi
                    $.ajax(url = this.queryURL + element + '/', method = this.queryMethod)
                        .done(function(response) {
                            // Push name and ID to currentQuestion.
                            currentQuestion.answers.push(response.species.name);
                            currentQuestion.ids.push(response.id);
                            // Check whether to start the question.
                            this.startQuestion();
                        });
                });
            }
        },

        startQuestion: function(){
            if (currentQuestion.ids.length === 4){
                
            }
        }
    }

    //DOM functions
    let DOMFunctions = {
        showTimer : function(){
            $('.timer').css('display', 'block');
        },
        showTimeLeft: function(){
            $('#timer').text(timeRemaining);
        },
        showGIF : function(){
            //hides start button
            $('.start').hide();
            $('.timer').css('display','block');
            $('.loading-image').css('display','block');
        },
        showQuestion: function(){
            //Hide loading gif
            $('.loading-image').hide();
            $('.question-display').show();
            $('.display-options').show();
            $('.answer-options').show();

            //make pokemon image silhouetted
            $('.poke-image').addclass('silhouette');
            $('.question-image').attr('src', '/image/' + currentQuestion.ids[currentQuestion.answerIndex] + '.png');
            $('.question-image').attr('alt', 'pokemon\'s silhouette');

            //adding answer options
            for (let i = 0; i < currentQuestion.answer.length; i++){
                option = $('<p>');
                option.text(currentQuestion.answer[i]);
                option.addclass('text-center option');
                option.attr('role','button');
                option.attr('data-name',currentQuestion.answer[i]);
                $('.answer-options').append(option);
            }
        },
        showAnswer: function(correct){
            $('.timer').hide();
            $('.display-options').hide();
            $('.itsPokemon').show();
            $('#correct-answer').text('It\'s ' + currentQuestion.answers[currentQuestion.answerIndex] + '!');
            $('.poke-image').toggleClass('silhouette');
            $('.poke-image').attr('alt', 'An image of ' + currentQuestion.answers[currentQuestion.answerIndex]);
            if (correct === true) {
                $('#right-wrong').text('Correct!');
            } 
            else if (correct === false) {
                $('#right-wrong').text('Incorrect');
            } 
            else {
                $('#right-wrong').text('Time is Up!');
            }
            setTimeout(game.selectQuestion, 1500);
        },
        hideAnswer: function() {
            $('.timer').show();
            $('itsPokemon').hide();
        },
        showResults: function() {
            $('poke-image').hide();
            $('timer').hide();
            $('.resultBox').show();
            $('#correctAns').text('Correct: ' + correctAnswer);
            $('#incorrectAns').text('Incorrect: ' + wrongAnswer);
            $('#noAns').text('Unanswered: ' + noAnsAnswer);
            $('.restart').show();
        },
        showNewGame: function() {
            // Hide restart, timer section, and game results.
            $('.restartBtn').hide();
            $('.timer').hide();
            $('.resultBox').hide();
            // Clear timer text.
            $('#timer').text('');
            // Show start button.
            $('.start').show();
            // Ensure the first image will be silhouetted
            $('.poke-images').addClass('silhouette');
        },
        callDOMFunctions : function(event,correct, timeRemaining) {
            // call functions according to state of game
            if (event === 'startGame') {
                DOMFunctions.displayLoadingGIF();
            } else if (event === 'newQuestion') {
                DOMFunctions.hideAnswer();
                DOMFunctions.displayQuestion();
                DOMFunctions.displayTimer();
            } else if (event === 'countDown') {
                DOMFunctions.displayTimeLeft(timeRemaining);
            } else if (event === 'questionAnswered') {
                DOMFunctions.displayAnswer(correct);
            } else if (event === 'gameComplete') {
                DOMFunctions.hideAnswer();
                DOMFunctions.displayResults();
            } else if (event === 'restartClicked') {
                DOMFunctions.displayNewGame();
            }
        }
    };
    let timer = {
        count: 9,

        //countdown timer
        start: function(){
            timer.decrement();
            counter = setInterval(timer.decrement, 1000);
        },

        decrement: function(){
            timer.count--;
            DOMFunctions.callDOMFunctions(event = 'countDown',correct = null, timeRemaining = timer.count);
            if (timer.count === 0){
                timer.stop();
                game.updateScores();
                DOMFunctions.callDOMFunctions(events = 'questionAnswered', correct = '');
            }
        },

        //reset timer
        stop: function(){
            clearInterval(counter);
            timer.count = 9
        }
    }
})