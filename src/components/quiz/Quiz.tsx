import { motion, AnimatePresence } from "framer-motion";
import { useAtom } from "jotai";
import { currentQuestionAtom, scoreAtom, quizStateAtom } from "~/atoms/quiz";
import { questionVariants } from "~/motion/quizVariants";
import QuestionTitle from "./QuestionTitle";
import AnswerButton from "./AnswerButton";
import QuizScore from "./QuizScore";
import PBM from "../shared/PBM";
import dynamic from "next/dynamic";
import { api } from "~/utils/api";
import { useState } from "react";
import { IQuiz, Question } from "~/server/api/routers/quiz";
import { set } from "zod";
import clsx from "clsx";

const QuizScene = dynamic(() => import("./QuizScene"), { ssr: false });

const Quiz: React.FC = () => {
  const {
    mutateAsync: getQuiz,
    isLoading: isQuizLoading,
    isError: isQuizError,
    error: quizError,
  } = api.quiz.getQuiz.useMutation();
  const [prompt, setPrompt] = useState("");
  const [quizState, setQuizState] = useAtom(quizStateAtom);
  const [quizData, setQuizData] = useState<Question[]>([]);

  const handleGetQuiz = async () => {
    try {
      const data = await getQuiz({ prompt });
      setQuizData(data.quizData);
      setQuizState(1);
    } catch (error) {
      console.log(error);
    }
  };

  const [currentQuestion, setCurrentQuestion] = useAtom(currentQuestionAtom);
  const [score, setScore] = useAtom(scoreAtom);
  const currentQuiz = quizData[currentQuestion];

  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const handleAnswer = (selectedAnswer: string) => {
    setSelectedAnswer(selectedAnswer);
    if (selectedAnswer === currentQuiz?.answer) {
      setScore(score + 1);
    }
    setShowAnswer(true);
  };

  const handleContinue = () => {
    setShowAnswer(false);
    setSelectedAnswer(null);

    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setQuizState(2);
      setCurrentQuestion(0);
    }
  };

  const totalQuestions = quizData.length;
  const isLowScore = score <= totalQuestions / 2;

  // Determine the rotate value based on the score
  const rotateValue = isLowScore ? [0, -5, 5, -5, 0] : 0;
  const scaleValue = !isLowScore ? [1, 1.2, 1, 1.2, 1] : 1;

  const animateProps = {
    opacity: 1,
    scale: scaleValue,
    rotate: rotateValue,
  };

  const cardClasses =
    "min-h-[320px] max-w-[300px] md:max-w-md w-full max-w-md rounded-lg bg-card-main p-8 shadow-md border-secondary-highlight border";

  const handleRestart = () => {
    setQuizState(0);
    setPrompt("");
    setScore(0);
    setQuizData([]);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {quizState === 0 && (
          <motion.div
            key={currentQuestion}
            {...questionVariants}
            className={cardClasses}
          >
            <div className="grow" />
            <form
              className="flex w-full flex-col items-center justify-center"
              onClick={(e) => e.preventDefault()}
            >
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="mb-4 w-full rounded-md bg-secondary-highlight/50 p-2 text-white placeholder:text-white/70"
                placeholder="Enter a topic for your quiz..."
              />
              <button
                type="submit"
                className="mb-2 flex w-full flex-row flex-nowrap items-center justify-center rounded-md border border-secondary-highlight py-2 text-white transition-all duration-300 hover:scale-105 hover:border-secondary-highlight hover:bg-secondary-highlight/25 disabled:pointer-events-none disabled:opacity-50"
                onClick={handleGetQuiz}
                disabled={isQuizLoading || prompt.length === 0}
              >
                {isQuizLoading && (
                  <span className="loading loading-spinner loading-md mr-2" />
                )}

                {isQuizLoading
                  ? "Loading..."
                  : prompt.length === 0
                  ? "Enter a topic above to start"
                  : "Start Quiz"}
              </button>
            </form>
          </motion.div>
        )}

        {quizState === 1 && (
          <motion.div
            key={currentQuestion}
            {...questionVariants}
            className={cardClasses}
          >
            <QuestionTitle title={currentQuiz?.question || "Error"} />
            <div className="divider before:bg-secondary-highlight/80 after:bg-secondary-highlight/80" />
            {currentQuiz?.options.map((option, index) => (
              <AnswerButton
                key={index}
                option={option}
                handleAnswer={handleAnswer}
                isCorrectAnswer={option === currentQuiz.answer}
                isAnswered={showAnswer}
                isSelected={option === selectedAnswer}
              />
            ))}
            {showAnswer && (
              <button
                className="mb-2 mt-8 flex w-full flex-row flex-nowrap items-center justify-center rounded-md border bg-secondary-highlight py-2 font-medium text-white transition-all duration-300 hover:scale-105 hover:bg-secondary-main"
                onClick={handleContinue}
              >
                Continue
              </button>
            )}
          </motion.div>
        )}

        {quizState === 2 && (
          <motion.div
            initial={{ opacity: 0, scale: isLowScore ? 0.8 : 1.2 }}
            animate={animateProps}
            exit={{ opacity: 0, scale: 0.5 }}
            className={cardClasses}
          >
            <QuestionTitle
              title={`You scored ${score} out of ${totalQuestions}`}
            />

            <div className="flex flex-col items-center">
              <button
                className="mb-2 flex w-full flex-row flex-nowrap items-center justify-center rounded-md border border-secondary-highlight py-2 text-white transition-all duration-300 hover:scale-105 hover:border-secondary-highlight hover:bg-secondary-highlight/25 disabled:pointer-events-none disabled:opacity-50"
                onClick={() => alert("woweeeee")}
              >
                Continue this Quiz
              </button>
              <button
                className="mb-2 flex w-full flex-row flex-nowrap items-center justify-center rounded-md border border-secondary-highlight py-2 text-white transition-all duration-300 hover:scale-105 hover:border-secondary-highlight hover:bg-secondary-highlight/25 disabled:pointer-events-none disabled:opacity-50"
                onClick={handleRestart}
              >
                New Quiz
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {quizData.length > 0 && (
        <QuizScore
          currentQuestion={currentQuestion}
          quizDataLength={totalQuestions}
        />
      )}
      <PBM />
      <QuizScene />
    </>
  );
};

export default Quiz;
