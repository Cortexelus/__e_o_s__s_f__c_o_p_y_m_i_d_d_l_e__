#include <eosiolib/eosio.hpp>
#include <eosiolib/print.hpp>

using namespace eosio;

class [[eosio::contract]] leaderboard : public eosio::contract {

public:
  using contract::contract;
  
  leaderboard(name receiver, name code,  datastream<const char*> ds): contract(receiver, code, ds) {}

  [[eosio::action]]
  void newscore(name user, uint64_t newscore){
    require_auth( user );
    score_index scoretable(_code, _code.value);

    auto iterator = scoretable.find(user.value);
    if( iterator == scoretable.end() )
    {
      scoretable.emplace(user, [&]( auto& row ) {
       row.user = user;
        row.score_value = newscore;
      });
    }else {
      // user already has a value
      if(iterator->score_value<newscore){
        // new score is larger
        scoretable.modify(iterator, user, [&]( auto& row ) {
          row.user = user;
          row.score_value = newscore;
        });
      }
    }
 

  }
  

  struct [[eosio::table]] score {
    name user;
    uint64_t score_value;
    uint64_t primary_key() const { return user.value; }
    uint64_t by_score() const {return score_value; }

  };
  typedef eosio::multi_index<"scores"_n, score> score_index;

};

EOSIO_DISPATCH( leaderboard, (newscore))

      