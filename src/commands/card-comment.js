"use strict";

var _ = require("underscore");

var __ = function(program, output, logger, config, trello, translator, commands, defaults) {

  var trelloApiCommand = {};

  trelloApiCommand.makeTrelloApiCall = function(options, onComplete) {
    const card_re = /(?:(?:https?:\/\/)?(?:www\.)?trello\.com\/c\/)?([a-z0-9]+)\/?.*/i;

    var boardId = "";
    try {
      boardId = translator.getBoardIdByName(options.board);
    } catch (err) {
      logger.error(`Unknown board [${options.board}]. ${err}`);
      return;
    }

    var lists = [];
    if (options.list) {
      var id = ""
      try {
        id = translator.getListIdByBoardNameAndListName(
          options.board,
          options.list
        )
      } catch (err) {
        logger.error(`Unknown list [${options.list}] on board [${options.board}]. ${err}`);
        return;
      }
      lists.push({
        name: options.list,
        id: id
      });
    } else {
      _.each(translator.cache.translations.lists, function(oneList, listId) {
        if (listId != "undefined" && oneList["board"] == boardId) {
          lists.push({
            name: oneList["name"],
            id: listId
          });
        }
      });
    }

    var cards = [];
    var numberOfList = lists.length;
    var numberOfListSearch = 0;
    lists.forEach(function(list) {
      trello.get(
        "/1/lists/" + list.id + "",
        {
          cards: "open"
        },
        function(err, data) {
          if (err) {
            throw err;
          }
          if (data.cards.length > 0) {
            for (var i in data.cards) {
              var cardName = data.cards[i].name.replace(/\n/g, "");
              cardName = cardName.toLowerCase();
              if (
                options.card.toLowerCase() ==
                  data.cards[i].shortLink.toLowerCase() ||
                cardName.indexOf(options.card.toLowerCase()) != -1
              ) {
                cards.push({
                  name: cardName,
                  id: data.cards[i].shortLink,
                  listName: list.name
                });
              }
            }
          }
          numberOfListSearch = numberOfListSearch + 1;
          if (numberOfListSearch == numberOfList) {
            if (cards.length == 0) {
              logger.error(`No matching cards found: [${options.card}].`);
              return;
            } else if (cards.length > 1) {
              var msg = "Multiple matching cards found:";
              for (var i in cards) {
                msg += "\n  " + cards[i].cardName + " in " + cards[i].listName;
              }
              logger.error(msg);
              return;
            }
            var args = [
              "/1/cards/" + cards[0].id + "/actions/comments",
              { text: options.text },
              function(err, data) {
                if (err) {
                  console.error(err, data);
                } else {
                  console.log(`Comment added to card '${cards[0].name}' [${cards[0].id}]`);
                }
              }
            ];
            trello.post(...args);
          }
        }
      );
    });
  };

  trelloApiCommand.nomnomProgramCall = function() {
    var boardOption = {
      abbr: "b",
      metavar: "BOARD",
      help: "The board on which the card exists",
      required: true
    };
    if (defaults.board && defaults.board != "") {
      boardOption.default = defaults.board;
    }
    var listOption = {
      abbr: "l",
      metavar: "LIST",
      help: "The list on which the card exists",
      required: false
    };
    if (defaults.list && defaults.list != "") {
      listOption.default = defaults.list;
    }
    var cardOption = {
      abbr: "c",
      metavar: "CARD",
      help: "The card's name/id/url",
      required: true
    };
    if (defaults.card && defaults.card != "") {
      cardOption.default = defaults.card;
    }
    program
      .command("card-comment")
      .help("Add a comment to a card")
      .options({
        board: boardOption,
        list: listOption,
        card: cardOption,
        text: {
          position: 1,
          metavar: "<text>",
          help: "The text of thje comment to add",
          required: true
        }
      })
      .callback(function(options) {
        trelloApiCommand.makeTrelloApiCall(options);
      });
  };

  return trelloApiCommand;
};
module.exports = __;
